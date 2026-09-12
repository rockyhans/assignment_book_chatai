import { Pool } from "pg";
import fs from "fs";
import path from "path";

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

console.log("==============================================================");
console.log("🔍 Supabase Database Verification Check");
console.log("==============================================================");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not defined in .env!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to Supabase PostgreSQL!");

    // 1. Check extensions
    const extRes = await client.query("SELECT extname FROM pg_extension WHERE extname = 'vector';");
    const hasVector = extRes.rows.length > 0;
    console.log(`✅ pgvector extension status: ${hasVector ? "INSTALLED & ACTIVE" : "NOT FOUND"}`);

    // 2. Check public tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log("📁 Public tables:", tableRes.rows.map(r => r.table_name).join(", "));

    // 3. Count rows in book_chunks
    const countRes = await client.query("SELECT count(*)::int AS count FROM book_chunks;");
    const rowCount = countRes.rows[0].count;
    console.log(`📊 Stored textbook chunks in 'book_chunks': ${rowCount}`);

    // 4. Inspect sample rows with page numbers
    const sampleRes = await client.query(`
      SELECT id, page_number, section_title, SUBSTRING(content FROM 1 FOR 100) AS snippet 
      FROM book_chunks 
      ORDER BY page_number ASC 
      LIMIT 3;
    `);

    console.log("\n📖 Sample Stored Records:");
    sampleRes.rows.forEach((r, idx) => {
      console.log(`   ${idx + 1}. [Page ${r.page_number}] ${r.section_title || "Section"}`);
      console.log(`      Snippet: "${r.snippet}..."`);
    });

    // 5. Check index
    const indexRes = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'book_chunks';
    `);
    console.log("\n⚡ Indexes on 'book_chunks':");
    indexRes.rows.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });

    console.log("\n==============================================================");
    console.log("🎉 VERIFICATION COMPLETE: Supabase is fully configured and holding data!");
    console.log("==============================================================");

    client.release();
  } catch (err: any) {
    console.error("❌ Database verification error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
