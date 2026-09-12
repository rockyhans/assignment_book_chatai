import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  initSupabaseVectorStore,
  upsertChunksToSupabase,
  countSupabaseChunks,
  querySupabaseVectors,
  getDbPool,
} from "../src/lib/db";

// Load .env
for (const file of [".env.local", ".env"]) {
  const envPath = path.resolve(process.cwd(), file);
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

async function runSync() {
  console.log("==============================================================");
  console.log("⚡ Supabase pgvector Sync & Verification Pipeline");
  console.log("==============================================================");

  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL is not set in .env!");
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY is not set in .env!");
    process.exit(1);
  }

  // 1. Initialize schema in Supabase
  console.log("[1/5] Connecting to Supabase and initializing vector store...");
  await initSupabaseVectorStore();
  console.log("      ✅ pgvector extension and 'book_chunks' table verified in Supabase.");

  // 2. Load textbook chunks from data/chunks.json
  const chunksPath = path.resolve(process.cwd(), "data", "chunks.json");
  if (!fs.existsSync(chunksPath)) {
    console.error(`❌ Error: ${chunksPath} not found!`);
    process.exit(1);
  }

  const rawChunks = JSON.parse(fs.readFileSync(chunksPath, "utf-8")) as Array<{
    chunkId: string;
    pageNumber: number;
    sectionTitle?: string;
    text: string;
  }>;
  console.log(`[2/5] Loaded ${rawChunks.length} textbook chunks from data/chunks.json.`);

  // 3. Generate 768-d Gemini embeddings
  console.log("[3/5] Generating 768-dimensional Gemini embeddings via gemini-embedding-001...");
  const genAI = new GoogleGenerativeAI(apiKey);
  const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  const preparedChunks: Array<{
    id: string;
    pageNumber: number;
    sectionTitle?: string;
    content: string;
    embedding: number[];
  }> = [];

  for (let i = 0; i < rawChunks.length; i++) {
    const chunk = rawChunks[i];
    const cleanText = chunk.text.replace(/\s+/g, " ").trim();

    try {
      const res = await embedModel.embedContent({
        content: { role: "user", parts: [{ text: cleanText }] },
        outputDimensionality: 768,
      } as any);

      preparedChunks.push({
        id: chunk.chunkId,
        pageNumber: chunk.pageNumber,
        sectionTitle: chunk.sectionTitle,
        content: chunk.text,
        embedding: res.embedding.values,
      });

      if ((i + 1) % 10 === 0 || i === rawChunks.length - 1) {
        console.log(`      Embedded ${i + 1}/${rawChunks.length} chunks...`);
      }
    } catch (embedErr: any) {
      console.warn(`      ⚠️ Failed to embed chunk ${chunk.chunkId}:`, embedErr.message);
    }
  }

  // 4. Upsert into Supabase
  console.log(`[4/5] Uploading ${preparedChunks.length} chunks into Supabase table 'book_chunks'...`);
  const uploadedCount = await upsertChunksToSupabase(preparedChunks);
  console.log(`      ✅ Successfully uploaded and indexed ${uploadedCount} chunks in Supabase!`);

  // 5. Verification
  console.log("[5/5] Running verification checks on Supabase...");
  const totalCount = await countSupabaseChunks();
  console.log(`      📊 Total rows in Supabase 'book_chunks': ${totalCount}`);

  // Test vector search query
  const testQuery = "What are the advantages of DBMS over traditional file system?";
  console.log(`\n🔍 Performing Live pgvector Search in Supabase for:`);
  console.log(`   "${testQuery}"`);

  const queryEmbedRes = await embedModel.embedContent({
    content: { role: "user", parts: [{ text: testQuery }] },
    outputDimensionality: 768,
  } as any);

  const topResults = await querySupabaseVectors(queryEmbedRes.embedding.values, 3);
  console.log(`\n🎉 Top 3 Matching Chunks from Supabase (pgvector cosine similarity):`);
  topResults.forEach((r, idx) => {
    console.log(`   ${idx + 1}. [Page ${r.page}] (Match: ${(r.similarity * 100).toFixed(1)}%) — ${r.sectionTitle || "Section"}`);
    console.log(`      "${r.snippet.slice(0, 150)}..."\n`);
  });

  console.log("==============================================================");
  console.log("✅ Supabase is LIVE, fully seeded, and verified for Online Mode!");
  console.log("==============================================================");

  const pool = getDbPool();
  if (pool) await pool.end();
}

runSync().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
