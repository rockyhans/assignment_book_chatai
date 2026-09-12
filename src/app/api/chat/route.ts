import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { embedOffline } from "@/lib/embed-offline";
import { embedOnline, getOnlineProvider } from "@/lib/embed-online";
import { retrieveOffline, retrieveOnline, RetrievalResult } from "@/lib/retrieve";
import { ChatRequest, ChatResponse } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Educational system prompt for Dumroo.ai's curriculum assistant.
 */
function buildSystemPrompt(chunks: RetrievalResult[]): string {
  const context = chunks
    .map(
      (c, idx) =>
        `[Source ${idx + 1} | Page ${c.page} | ${c.sectionTitle || "Textbook Section"}]\n${c.text}`
    )
    .join("\n\n---\n\n");

  return `You are Dumroo.ai's AI Teaching Assistant, an educational companion for K-12 students and teachers.
Your goal is to answer questions about the curriculum textbook clearly, accurately, and pedagogically.

STRICT CITATION RULES:
1. Base your answer PRIMARILY on the provided textbook excerpts below.
2. In your answer, explicitly mention and cite the page numbers where the concepts appear (e.g. "[Page 12]" or "According to Page 83...").
3. Break down complex scientific or mathematical ideas into digestible explanations with examples.
4. If the provided excerpts do not contain sufficient information, state what is known from the excerpts and clarify what is not covered.

TEXTBOOK EXCERPTS:
${context}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;
    const { question, mode = "offline" } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "A valid question is required." }, { status: 400 });
    }

    const cleanQuestion = question.trim();

    // ==========================================
    // 1. OFFLINE MODE (100% Local Extractive RAG)
    // ==========================================
    if (mode === "offline") {
      // Step A: Local embedding using @xenova/transformers (all-MiniLM-L6-v2)
      const queryVec = await embedOffline(cleanQuestion);

      // Step B: In-memory retrieval over /data/chunks.json
      const topChunks = retrieveOffline(queryVec, 4);

      if (topChunks.length === 0) {
        const emptyResponse: ChatResponse = {
          answer: "No relevant sections were found in the textbook for your query.",
          mode: "offline",
          sources: [],
        };
        return NextResponse.json(emptyResponse);
      }

      // Step C: Extractive answer — return the best-matching chunk text directly (no LLM call)
      const bestChunk = topChunks[0];
      const answer = `[Offline Extractive Answer — Page ${bestChunk.page}]\n\n${bestChunk.text}`;

      const response: ChatResponse = {
        answer,
        mode: "offline",
        sources: topChunks.map((c) => ({
          chunkId: c.chunkId,
          page: c.page,
          sectionTitle: c.sectionTitle,
          snippet: c.snippet,
          similarity: c.similarity,
        })),
      };

      return NextResponse.json(response);
    }

    // ==========================================
    // 2. ONLINE MODE (Generative RAG via Cloud LLM)
    // ==========================================
    const provider = getOnlineProvider();

    // If cloud provider is not configured, gracefully explain and provide retrieved context
    if (!provider) {
      // Still retrieve using local vectors so user gets real answers
      const queryVec = await embedOffline(cleanQuestion);
      const topChunks = retrieveOffline(queryVec, 4);
      const bestChunk = topChunks[0];

      const notice =
        `⚠️ **Online Cloud LLM Key Not Configured**\n\n` +
        `To enable generative cloud answers, please add \`GEMINI_API_KEY\` or \`OPENAI_API_KEY\` to your \`.env.local\` file.\n\n` +
        `*Below is the exact curriculum excerpt extracted from Page ${bestChunk.page}:*\n\n` +
        bestChunk.text;

      const response: ChatResponse = {
        answer: notice,
        mode: "online",
        sources: topChunks.map((c) => ({
          chunkId: c.chunkId,
          page: c.page,
          sectionTitle: c.sectionTitle,
          snippet: c.snippet,
          similarity: c.similarity,
        })),
      };

      return NextResponse.json(response);
    }

    // Step A: Cloud query embedding
    let queryVec: number[];
    let retrievedChunks: RetrievalResult[];

    try {
      queryVec = await embedOnline(cleanQuestion);
      retrievedChunks = await retrieveOnline(queryVec, 4);
    } catch {
      // Fallback to offline embeddings for retrieval if cloud embed quota or error
      queryVec = await embedOffline(cleanQuestion);
      retrievedChunks = retrieveOffline(queryVec, 4);
    }

    // Step B: Generative LLM call
    const systemPrompt = buildSystemPrompt(retrievedChunks);
    let generatedAnswer = "";

    try {
      if (provider === "gemini") {
        const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)!;
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try modern available Gemini models with automatic fallback
        const modelCandidates = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"];
        let lastError: any = null;

        for (const modelName of modelCandidates) {
          try {
            const model = genAI.getGenerativeModel({
              model: modelName,
              systemInstruction: systemPrompt,
            });
            const result = await model.generateContent(cleanQuestion);
            generatedAnswer = result.response.text();
            break;
          } catch (mErr: any) {
            console.warn(`Attempt with ${modelName} failed:`, mErr.message);
            lastError = mErr;
          }
        }

        if (!generatedAnswer) {
          throw lastError || new Error("Failed to generate response across all Gemini model candidates.");
        }
      } else if (provider === "openai") {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: cleanQuestion },
          ],
        });
        generatedAnswer = completion.choices[0]?.message?.content || "No answer generated.";
      }
    } catch (llmErr: any) {
      console.warn("Cloud LLM generation call failed:", llmErr.message);
      const best = retrievedChunks[0];
      generatedAnswer =
        `⚠️ **Cloud LLM Notice**: Could not complete generative synthesis (${llmErr.message || "API error"}).\n\n` +
        `*Below is the exact curriculum excerpt extracted from Page ${best.page}:*\n\n` +
        best.text;
    }

    const response: ChatResponse = {
      answer: generatedAnswer,
      mode: "online",
      retrievalSource: process.env.DATABASE_URL ? "supabase" : "in-memory",
      sources: retrievedChunks.map((c) => ({
        chunkId: c.chunkId,
        page: c.page,
        sectionTitle: c.sectionTitle,
        snippet: c.snippet,
        similarity: c.similarity,
      })),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during chat processing.",
      },
      { status: 500 }
    );
  }
}
