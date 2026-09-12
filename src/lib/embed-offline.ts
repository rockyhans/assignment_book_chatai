import { pipeline } from "@huggingface/transformers";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractorInstance: any = null;

/**
 * Singleton pipeline loader for local transformer model.
 * Uses Xenova/all-MiniLM-L6-v2 which runs 100% locally via ONNX Runtime Web/Node.
 */
export async function getOfflineExtractor() {
  if (!extractorInstance) {
    extractorInstance = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorInstance;
}

/**
 * Generate a 384-dimensional normalized embedding for text using local all-MiniLM-L6-v2 model.
 * Performs zero external network calls.
 */
export async function embedOffline(text: string): Promise<number[]> {
  const extractor = await getOfflineExtractor();
  const cleanText = text.replace(/\s+/g, " ").trim();
  const output = await extractor(cleanText, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}
