import fs from "fs";
import path from "path";
import { Chunk, SourceCitationData } from "../types";
import { isDatabaseConfigured, querySupabaseVectors } from "./db";

export interface RetrievalResult extends SourceCitationData {
  text: string;
}

let cachedChunks: Chunk[] | null = null;

/**
 * Loads the pre-ingested chunks from /data/chunks.json.
 * Caches in memory for fast repeated retrieval.
 */
export function loadChunks(): Chunk[] {
  if (cachedChunks) {
    return cachedChunks;
  }

  const chunksPath = path.join(process.cwd(), "data", "chunks.json");
  if (!fs.existsSync(chunksPath)) {
    throw new Error(
      "Chunks file not found at /data/chunks.json. Please run 'npm run ingest' to generate chunks and embeddings."
    );
  }

  const raw = fs.readFileSync(chunksPath, "utf-8");
  cachedChunks = JSON.parse(raw) as Chunk[];
  return cachedChunks;
}

/**
 * Computes standard cosine similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized embeddings).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    // If dimension mismatch (e.g. comparing 384-d with 768-d), return 0
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;

  return dot / denom;
}

/**
 * Creates a clean text snippet with ellipsis for citations.
 */
function createSnippet(text: string, maxLength = 260): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Offline retrieval: in-memory cosine similarity over chunks.json using local 384-d embeddings.
 */
export function retrieveOffline(queryEmbedding: number[], topK = 4): RetrievalResult[] {
  const chunks = loadChunks();

  const scored = chunks
    .map((chunk) => {
      const sim = cosineSimilarity(queryEmbedding, chunk.embeddings.offline);
      return {
        chunkId: chunk.chunkId,
        page: chunk.pageNumber,
        sectionTitle: chunk.sectionTitle,
        snippet: createSnippet(chunk.text),
        text: chunk.text,
        similarity: Math.max(0, parseFloat(sim.toFixed(4))),
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, topK);
}

/**
 * Online retrieval: queries pgvector / Chroma if configured, or falls back to in-memory cosine similarity
 * over online embeddings in /data/chunks.json.
 */
export async function retrieveOnline(queryEmbedding: number[], topK = 4): Promise<RetrievalResult[]> {
  // 1. Primary Online Vector Store: Supabase pgvector
  if (isDatabaseConfigured()) {
    try {
      const dbResults = await querySupabaseVectors(queryEmbedding, topK);
      if (dbResults.length > 0) {
        return dbResults;
      }
    } catch (dbErr: any) {
      console.warn("Supabase pgvector query encountered an issue, checking secondary fallbacks:", dbErr.message);
    }
  }

  // 2. Secondary fallback: Chroma if configured via env
  if (process.env.CHROMA_URL) {
    try {
      const res = await fetch(`${process.env.CHROMA_URL}/api/v1/collections/book-qa/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_embeddings: [queryEmbedding], n_results: topK }),
      });
      if (res.ok) {
        const data = await res.json();
        // Return parsed Chroma results
        if (data.documents && data.documents[0]) {
          return data.documents[0].map((doc: string, idx: number) => {
            const meta = data.metadatas[0][idx] || {};
            const dist = data.distances ? data.distances[0][idx] : 0;
            const sim = 1 - dist;
            return {
              chunkId: data.ids[0][idx],
              page: meta.pageNumber || 1,
              sectionTitle: meta.sectionTitle,
              snippet: createSnippet(doc),
              text: doc,
              similarity: Math.max(0, parseFloat(sim.toFixed(4))),
            };
          });
        }
      }
    } catch {
      console.warn("Chroma query failed, falling back to in-memory online chunks store.");
    }
  }

  // In-memory retrieval over chunks.json
  const chunks = loadChunks();
  const scored = chunks
    .map((chunk) => {
      // Check if online embedding is available for chunk, otherwise fallback to offline similarity
      const targetVec =
        chunk.embeddings.online && chunk.embeddings.online.length === queryEmbedding.length
          ? chunk.embeddings.online
          : null;

      const sim = targetVec ? cosineSimilarity(queryEmbedding, targetVec) : 0;

      return {
        chunkId: chunk.chunkId,
        page: chunk.pageNumber,
        sectionTitle: chunk.sectionTitle,
        snippet: createSnippet(chunk.text),
        text: chunk.text,
        similarity: Math.max(0, parseFloat(sim.toFixed(4))),
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, topK);
}
