export interface Chunk {
  chunkId: string;
  pageNumber: number;
  sectionTitle?: string;
  text: string;
  embeddings: {
    offline: number[]; // 384-dimensional vector from all-MiniLM-L6-v2
    online?: number[];  // 768-dim (Gemini) or 1536-dim (OpenAI)
  };
}

export interface SourceCitationData {
  chunkId: string;
  page: number;
  sectionTitle?: string;
  snippet: string;
  similarity: number;
}

export interface ChatResponse {
  answer: string;
  mode: "online" | "offline";
  sources: SourceCitationData[];
  retrievalSource?: "supabase" | "chroma" | "in-memory";
}

export interface ChatRequest {
  question: string;
  mode: "online" | "offline";
}
