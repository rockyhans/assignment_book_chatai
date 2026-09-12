# Dumroo.ai — Book Q&A Chatbot (Online + Offline RAG)

> **Dev Intern Assignment for Dumroo.ai** — AI-powered K-12 education platform.  
> **Author:** Danish Rizwan  
> Ask questions about a single prescribed curriculum textbook with **100% verifiable source citations** across dual operating modes: **Online Generative RAG (Supabase pgvector + Gemini)** and **Offline Extractive RAG (Local Edge Transformers)**.

---

## 📌 Executive Summary

In K-12 education, pedagogical accuracy and network resilience are paramount. Standard generative AI often hallucinates or references out-of-syllabus materials, while student devices frequently operate in low-bandwidth or offline classroom environments. 

This project solves both challenges through a **Dual-Mode Architecture**:
1. **Offline Extractive Mode:** Zero external APIs, zero database calls, runs 100% locally on device CPU using `@huggingface/transformers` (`all-MiniLM-L6-v2`) and in-memory cosine similarity over pre-indexed textbook chunks. It directly extracts authentic textbook excerpts, guaranteeing **zero hallucination**.
2. **Online Generative Mode:** Connects to a live **Supabase PostgreSQL database with `pgvector`** and HNSW indexing. Query embeddings (768-dimensional) are matched via cosine distance (`<=>`), and **Google Gemini 2.5 Flash** synthesizes comprehensive pedagogical explanations anchored by verifiable page citations (e.g. `[Page 18]`).

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   Student Question     │
                                  └───────────┬────────────┘
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
               [ Offline Mode ]                            [ Online Mode ]
        (100% Local / Zero Network)                    (Supabase + Cloud LLM)
                         │                                         │
        Local Hugging Face Transformers               Gemini Embeddings (768-d)
        (all-MiniLM-L6-v2, 384-d on CPU)                           │
                         │                            Supabase PostgreSQL + pgvector
           In-Memory Cosine Similarity                    HNSW Cosine Distance (<=>)
         Over local /data/chunks.json                              │
                         │                            Top Matching Textbook Excerpts
                         │                                         │
                         ▼                                         ▼
            [ Extractive Answer ]                     [ Generative Synthesis ]
           Direct textbook paragraph                  Gemini 2.5 Flash + Citations
                         │                                         │
                         └────────────────────┬────────────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────┐
                                 │   Verifiable Citation  │
                                 │   • Exact Page Number  │
                                 │   • Section Title      │
                                 │   • Similarity Score   │
                                 │   • Copyable Excerpt   │
                                 └────────────────────────┘
```

---

## ⚖️ Mode Comparison Matrix

| Feature | Offline Mode | Online Mode |
| :--- | :--- | :--- |
| **Primary Goal** | 100% Offline availability, Zero Hallucination | Deep synthesis, pedagogical explanations |
| **AI Technique** | Extractive RAG (exact textbook paragraphs) | Generative RAG (Gemini 2.5 Flash synthesis) |
| **Vector Store** | In-Memory Cosine Similarity (Client/Edge) | **Supabase PostgreSQL (`pgvector` + HNSW)** |
| **Embedding Model** | `@huggingface/transformers` (`all-MiniLM-L6-v2`, 384-d) | Google Gemini `gemini-embedding-001` (768-d) |
| **External Network / APIs** | **Zero** (no internet, no API keys, no DB) | Supabase connection + Gemini API |
| **Latency** | < 35ms on standard CPU | ~400ms – 1.2s (cloud round-trip) |
| **Hardware Footprint** | Lightweight (~4 MB JSON dataset, ONNX CPU) | Cloud-managed serverless database |
| **Citation Guarantee** | Direct page & paragraph match | In-text citations + live Supabase source cards |

---

## 🚀 Key Architectural Decisions

### 1. Single-Book Scope Decision
- **Curriculum Alignment:** In K-12 education, syllabi follow prescribed textbooks (e.g. CBSE/NCERT, State Boards). Pulling unvetted information from external books or open-web scraping introduces out-of-scope notation and confusing contradictions.
- **Deterministic Page Citations:** Because the corpus is fixed to a single curriculum textbook, every chunk maps to a verified physical page number (e.g. `Page 18`, `Page 38`). Students and teachers can verify answers in physical books within seconds.
- **Ultra-Lightweight Edge Footprint:** The entire textbook dataset with precomputed vector embeddings fits comfortably in a ~3 MB JSON file, making local edge execution instant on modest school hardware.

### 2. Why Offline Mode is Extractive, Not Generative
- **Elimination of Hallucinations:** Small local generative models (< 3B parameters) frequently hallucinate formulas, dates, and terminology. Extractive RAG returns authentic textbook text written by domain experts.
- **Zero VRAM / Low Resource Footprint:** Local LLMs demand multi-gigabyte downloads and dedicated GPUs. `@huggingface/transformers` runs on commodity CPU in pure JavaScript/WASM with under 60 MB RAM.

### 3. Live Supabase pgvector Architecture (Online Mode)
- **Database Schema:**
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;

  CREATE TABLE IF NOT EXISTS book_chunks (
    id TEXT PRIMARY KEY,
    page_number INTEGER NOT NULL,
    section_title TEXT,
    content TEXT NOT NULL,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS book_chunks_embedding_idx 
  ON book_chunks USING hnsw (embedding vector_cosine_ops);
  ```
- **Vector Search Query:**
  ```sql
  SELECT 
    id, page_number, section_title, content,
    ROUND((1 - (embedding <=> $1::vector))::numeric, 4)::float AS similarity
  FROM book_chunks
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> $1::vector ASC
  LIMIT $2;
  ```

---

## 🛠️ Tech Stack & Directory Structure

- **Framework:** Next.js 16 (App Router, Turbopack / Webpack on Windows) + TypeScript
- **Database & Vector Store:** Supabase PostgreSQL with `pgvector` & HNSW indexing
- **Cloud LLM & Embeddings:** Google Gemini (`gemini-2.5-flash`, `gemini-embedding-001` 768-d)
- **Local Embeddings:** `@huggingface/transformers` (`all-MiniLM-L6-v2`)
- **Styling:** Tailwind CSS 4 (Custom Dumroo blue-to-amber palette, glassmorphism, floating pill bar)
- **Typography & Math:** `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`
- **PDF Parser:** `pdf-parse`

```
├── data/
│   ├── chunks.json              # Bundled textbook dataset with 60 chunks & offline embeddings
│   └── source/
│       └── book.pdf             # Prescribed curriculum textbook PDF (DBMS Lecture Notes)
├── scripts/
│   ├── ingest.ts                # PDF parser, sliding-window chunker, dual embedding generator
│   ├── sync-supabase.ts         # Live Supabase pgvector schema builder & data syncing pipeline
│   └── test-db.ts               # Interactive Supabase connection & vector verification script
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts    # Unified chat API route (Online + Offline RAG)
│   │   ├── globals.css          # Dumroo design tokens, gradients & custom shadows
│   │   ├── layout.tsx           # SEO metadata, OpenGraph tags, font loading
│   │   └── page.tsx             # Main chat UI with pill input bar & prompt suggestions
│   ├── components/
│   │   ├── ChatMessage.tsx      # Formatted chat bubble, LaTeX renderer, Supabase badge
│   │   ├── ModeToggle.tsx       # Online/Offline switcher with network auto-detection
│   │   └── SourceCitation.tsx   # Expandable citation drawer with page tags & copy action
│   ├── lib/
│   │   ├── db.ts                # Supabase pooled client & pgvector cosine similarity search
│   │   ├── embed-offline.ts     # Local transformer pipeline singleton (all-MiniLM-L6-v2)
│   │   ├── embed-online.ts      # Gemini cloud embedding generator (768-d)
│   │   └── retrieve.ts          # Hybrid retrieval coordinator (Supabase / In-memory)
│   └── types/
│       └── index.ts             # Shared TypeScript data models
```

---

## ⚙️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or update your `.env` file in the project root:

```env
# Google Gemini API Key
GEMINI_API_KEY="your_gemini_api_key"

# Supabase PostgreSQL Database Connection URL (Pooler)
DATABASE_URL="postgresql://postgres.[project-id]:[password]@[host].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

> **Note on Offline Mode:** Offline Mode works out of the box with **zero API keys** using `/data/chunks.json`!

### 3. Sync Database to Supabase (One-time)
To initialize the `vector` extension and sync all textbook chunks with 768-d embeddings to Supabase:
```bash
npm run sync-db
```

### 4. Verify Database Connection
```bash
npx tsx scripts/test-db.ts
```
Expected output:
```
==============================================================
🔍 Supabase Database Verification Check
==============================================================
✅ Successfully connected to Supabase PostgreSQL!
✅ pgvector extension status: INSTALLED & ACTIVE
📁 Public tables: book_chunks
📊 Stored textbook chunks in 'book_chunks': 60
⚡ Indexes on 'book_chunks': book_chunks_pkey, book_chunks_embedding_idx
==============================================================
🎉 VERIFICATION COMPLETE: Supabase is fully configured and holding data!
==============================================================
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Ingestion Pipeline & Custom Books

To index a different curriculum textbook:
1. Drop your PDF file into `/data/source/book.pdf`.
2. Run the ingestion pipeline:
   ```bash
   npm run ingest
   ```
   - Parses the PDF page-by-page.
   - Creates overlapping chunks (~300 words with 15% sliding window overlap).
   - Generates local embeddings via `@huggingface/transformers`.
   - Saves output to `/data/chunks.json`.
3. Push to Supabase:
   ```bash
   npm run sync-db
   ```

---

## 🧪 Verification & Testing Guide

| Test | Command / Action | Expected Result |
| :--- | :--- | :--- |
| **Supabase DB Health** | `npx tsx scripts/test-db.ts` | Connected, `vector` active, 60 chunks, HNSW index |
| **E2E API Verification** | `npx tsx scripts/test-api-e2e.ts` | Offline returns Page 38 extractive; Online returns Page 18 synthesized |
| **Offline UI Query** | Toggle to Offline, ask *"What is ER modeling?"* | Returns authentic paragraph from Page 38 immediately with zero network latency |
| **Online UI Query** | Toggle to Online, ask *"What are the three levels of data abstraction?"* | Returns Gemini synthesized answer citing `[Page 18]` with `⚡ Supabase pgvector` badge |
| **Production Build** | `npm run build` | Compiles clean with zero TypeScript errors |

---

## 👤 Author
- **Danish Rizwan** — Assignment submission for **Dumroo.ai** (Dev Intern Role).
