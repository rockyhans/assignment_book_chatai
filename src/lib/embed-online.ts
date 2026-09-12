import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

import fs from "fs";
import path from "path";

function ensureEnvLoaded() {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY || process.env.NEXT_RUNTIME) {
    return;
  }
  for (const file of [".env.local", ".env"]) {
    const envPath = path.join(/*turbopackIgnore: true*/ process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf-8").split("\n");
      for (const line of lines) {
        const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*(.*)?\s*$/);
        if (match && !process.env[match[1]]) {
          let val = (match[2] || "").trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          process.env[match[1]] = val;
        }
      }
    }
  }
}

export function getOnlineProvider(): "gemini" | "openai" | null {
  ensureEnvLoaded();
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    return "gemini";
  }
  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }
  return null;
}

export function isOnlineConfigured(): boolean {
  return getOnlineProvider() !== null;
}

/**
 * Generate a cloud embedding for text using Google Gemini (text-embedding-004) or OpenAI (text-embedding-3-small).
 */
export async function embedOnline(text: string): Promise<number[]> {
  const provider = getOnlineProvider();

  if (provider === "gemini") {
    const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)!;
    const genAI = new GoogleGenerativeAI(apiKey);
    const cleanText = text.replace(/\s+/g, " ").trim();
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await model.embedContent({
        content: { role: "user", parts: [{ text: cleanText }] },
        outputDimensionality: 768,
      } as any);
      return result.embedding.values;
    } catch {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const result = await fallbackModel.embedContent(cleanText);
      return result.embedding.values;
    }
  }

  if (provider === "openai") {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const cleanText = text.replace(/\s+/g, " ").trim();
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cleanText,
    });
    return response.data[0].embedding;
  }

  throw new Error(
    "Cloud embedding requires either GEMINI_API_KEY or OPENAI_API_KEY to be configured in your environment (.env.local). Please configure an API key for Online Mode or switch to Offline Mode for 100% local, zero-API-key RAG!"
  );
}
