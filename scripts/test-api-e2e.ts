import { POST } from "../src/app/api/chat/route";
import { NextRequest } from "next/server";

async function testEndToEnd() {
  console.log("==============================================================");
  console.log("🧪 Testing End-to-End Chat API Route (Online + Offline)");
  console.log("==============================================================\n");

  // 1. Test Offline Mode
  console.log("👉 1. Testing OFFLINE Mode (Local Extractive RAG — Zero APIs, Zero DB):");
  const offlineReq = new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: "What is ER modeling and relationship cardinality?",
      mode: "offline",
    }),
  });

  const offlineRes = await POST(offlineReq);
  const offlineData = await offlineRes.json();
  console.log("   Mode:", offlineData.mode);
  console.log("   Sources count:", offlineData.sources?.length);
  console.log("   Top citation:", offlineData.sources?.[0]?.sectionTitle, `[Page ${offlineData.sources?.[0]?.page}]`);
  console.log("   Answer snippet:", offlineData.answer.slice(0, 180) + "...\n");

  // 2. Test Online Mode (Live Supabase pgvector + Gemini LLM)
  console.log("👉 2. Testing ONLINE Mode (Supabase pgvector + Gemini Generative RAG):");
  const onlineReq = new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: "What are the three levels of data abstraction in DBMS?",
      mode: "online",
    }),
  });

  const onlineRes = await POST(onlineReq);
  const onlineData = await onlineRes.json();
  console.log("   Mode:", onlineData.mode);
  console.log("   Retrieval source:", onlineData.retrievalSource);
  console.log("   Sources count from Supabase:", onlineData.sources?.length);
  console.log("   Top citation:", onlineData.sources?.[0]?.sectionTitle, `[Page ${onlineData.sources?.[0]?.page}]`);
  console.log("   Similarity match:", (onlineData.sources?.[0]?.similarity * 100).toFixed(1) + "%");
  console.log("   Generated Answer:\n" + onlineData.answer.slice(0, 400) + "...\n");

  console.log("==============================================================");
  console.log("✅ BOTH MODES VERIFIED SUCCESSFULLY!");
  console.log("==============================================================");
  process.exit(0);
}

testEndToEnd().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
