import { Pool } from "pg";
import fs from "fs";
import path from "path";

// Ensure .env is loaded if running in Node or standalone script
function ensureEnvLoaded() {
  if (process.env.DATABASE_URL || process.env.NEXT_RUNTIME) return;
  for (const file of [".env.local", ".env"]) {
    const envPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf-8").split("\n");
      for (const line of lines) {
        const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*(.*)?\s*$/);
        if (match && !process.env[match[1]]) {
          let val = (match[2] || "").trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          process.env[match[1]] = val;
        }
      }
    }
  }
}

ensureEnvLoaded();

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  ensureEnvLoaded();
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on("error", (err) => {
      console.warn("Unexpected Supabase pool client error:", err.message);
    });
  }

  return pool;
}

export function isDatabaseConfigured(): boolean {
  ensureEnvLoaded();
  return !!process.env.DATABASE_URL;
}

/**
 * Initializes the pgvector extension and the book_chunks table in Supabase.
 */
export async function initSupabaseVectorStore(): Promise<void> {
  const p = getDbPool();
  if (!p) throw new Error("DATABASE_URL is not defined in environment.");

  // 1. Enable pgvector extension
  await p.query("CREATE EXTENSION IF NOT EXISTS vector;");

  // 2. Create book_chunks table with 768-dim vector column
  await p.query(`
    CREATE TABLE IF NOT EXISTS book_chunks (
      id TEXT PRIMARY KEY,
      page_number INTEGER NOT NULL,
      section_title TEXT,
      content TEXT NOT NULL,
      embedding vector(768),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // 3. Create HNSW index for ultra-fast cosine similarity search
  try {
    await p.query(`
      CREATE INDEX IF NOT EXISTS book_chunks_embedding_idx 
      ON book_chunks USING hnsw (embedding vector_cosine_ops);
    `);
  } catch (idxErr: any) {
    console.warn("HNSW index creation note:", idxErr.message);
  }
}

/**
 * Upserts a batch of chunks into Supabase book_chunks.
 */
export async function upsertChunksToSupabase(
  chunks: Array<{
    id: string;
    pageNumber: number;
    sectionTitle?: string;
    content: string;
    embedding: number[];
  }>
): Promise<number> {
  const p = getDbPool();
  if (!p) throw new Error("DATABASE_URL is not defined.");

  let count = 0;
  for (const chunk of chunks) {
    const vectorStr = `[${chunk.embedding.join(",")}]`;
    await p.query(
      `
      INSERT INTO book_chunks (id, page_number, section_title, content, embedding)
      VALUES ($1, $2, $3, $4, $5::vector)
      ON CONFLICT (id) DO UPDATE SET
        page_number = EXCLUDED.page_number,
        section_title = EXCLUDED.section_title,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding;
      `,
      [chunk.id, chunk.pageNumber, chunk.sectionTitle || null, chunk.content, vectorStr]
    );
    count++;
  }

  return count;
}

/**
 * Counts rows currently in Supabase book_chunks table.
 */
export async function countSupabaseChunks(): Promise<number> {
  const p = getDbPool();
  if (!p) return 0;
  try {
    const res = await p.query("SELECT COUNT(*)::int AS count FROM book_chunks;");
    return res.rows[0]?.count || 0;
  } catch {
    return 0;
  }
}

export interface SupabaseRetrievalResult {
  chunkId: string;
  page: number;
  sectionTitle?: string;
  snippet: string;
  text: string;
  similarity: number;
}

/**
 * Queries Supabase using pgvector cosine distance operator (<=>).
 * Returns results ordered by highest similarity (1 - distance).
 */
export async function querySupabaseVectors(
  queryEmbedding: number[],
  topK = 4
): Promise<SupabaseRetrievalResult[]> {
  const p = getDbPool();
  if (!p) return [];

  const vectorStr = `[${queryEmbedding.join(",")}]`;
  const res = await p.query(
    `
    SELECT 
      id AS "chunkId",
      page_number AS "page",
      section_title AS "sectionTitle",
      content AS "text",
      ROUND((1 - (embedding <=> $1::vector))::numeric, 4)::float AS "similarity"
    FROM book_chunks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector ASC
    LIMIT $2;
    `,
    [vectorStr, topK]
  );

  return res.rows.map((row) => {
    const text = row.text || "";
    const clean = text.replace(/\s+/g, " ").trim();
    const snippet = clean.length > 260 ? clean.slice(0, 260).trimEnd() + "..." : clean;

    return {
      chunkId: row.chunkId,
      page: row.page,
      sectionTitle: row.sectionTitle,
      snippet,
      text,
      similarity: Math.max(0, row.similarity),
    };
  });
}
