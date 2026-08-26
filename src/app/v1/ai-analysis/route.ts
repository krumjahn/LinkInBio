import { handleAnalysis } from "@/lib/ai-proxy";

export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  try { return await handleAnalysis(request); }
  catch (cause) { console.error("[ai-proxy] Request failed", cause instanceof Error ? cause.message : "unknown"); return Response.json({ error: { code: "internal_error", message: "Built-in AI is temporarily unavailable." } }, { status: 500 }); }
}
