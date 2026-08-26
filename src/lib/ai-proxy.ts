function models() {
  return {
    // Pin known-good defaults in code so Railway only needs the two secret keys.
    // These can still be overridden without a release if a provider deprecates one.
    openai: process.env.OPENROUTER_OPENAI_MODEL || "openai/gpt-5.6-sol",
    anthropic: process.env.OPENROUTER_ANTHROPIC_MODEL || "anthropic/claude-opus-5",
  } as const;
}
const requests = new Map<string, { startedAt: number; count: number }>();

export type ProxyDependencies = { fetchImpl?: typeof fetch; now?: () => number };

export async function handleAnalysis(request: Request, dependencies: ProxyDependencies = {}) {
  const fetchImpl = dependencies.fetchImpl || fetch;
  const now = dependencies.now || Date.now;
  const MODELS = models();
  const openRouterKey = process.env.OPENROUTER_API_KEY || "";
  const revenueCatKey = process.env.REVENUECAT_SECRET_API_KEY || "";
  if (!openRouterKey || !revenueCatKey || !MODELS.openai || !MODELS.anthropic) {
    return error(503, "not_configured", "Built-in AI is temporarily unavailable.");
  }

  const appUserID = request.headers.get("x-revenuecat-app-user-id")?.trim() || "";
  if (!appUserID || appUserID.length > 256) return error(401, "unauthorized", "A valid subscription identity is required.");
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!takeRateLimit(`${appUserID}:${forwarded}`, now())) return error(429, "rate_limited", "Too many analysis requests. Please try again later.");

  const entitlement = process.env.REVENUECAT_ENTITLEMENT_ID || "Pro";
  const subscriber = await fetchImpl(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserID)}`, {
    headers: { Authorization: `Bearer ${revenueCatKey}` }, signal: AbortSignal.timeout(10_000),
  });
  if (!subscriber.ok || !(await hasEntitlement(subscriber, entitlement, now()))) {
    return error(403, "subscription_required", "An active Pro subscription is required.");
  }

  const maxBytes = Number(process.env.MAX_BODY_BYTES || 512_000);
  const bodyText = await request.text();
  if (Buffer.byteLength(bodyText) > maxBytes) return error(413, "body_too_large", "Analysis request is too large.");
  let payload: Record<string, unknown>;
  try { payload = JSON.parse(bodyText || "{}"); } catch { return error(400, "invalid_json", "Request body must be valid JSON."); }
  const provider = typeof payload.provider === "string" ? payload.provider : "";
  const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
  const summary = typeof payload.health_summary === "string" ? payload.health_summary.trim() : "";
  if (!(provider in MODELS) || !prompt || !summary) return error(400, "invalid_request", "Provider, prompt, and health summary are required.");

  const upstream = await fetchImpl("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openRouterKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://applehealthdata.com", "X-Title": "Health Data AI Analyzer" },
    body: JSON.stringify({ model: MODELS[provider as keyof typeof MODELS], messages: [{ role: "system", content: systemInstruction }, { role: "user", content: `${prompt}\n\nHealth Data Summary:\n${summary}` }], max_tokens: provider === "anthropic" ? 4000 : 8000, temperature: 0.3 }),
    signal: AbortSignal.timeout(290_000),
  });
  const result = await safeJSON(upstream);
  if (!upstream.ok) return error(502, "provider_error", "The AI provider could not complete this analysis.");
  const content = result?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) return error(502, "invalid_provider_response", "The AI provider returned an invalid response.");
  return Response.json({ content: content.trim() }, { headers: { "Cache-Control": "no-store" } });
}

async function hasEntitlement(response: Response, id: string, timestamp: number) {
  const body = await safeJSON(response); const item = body?.subscriber?.entitlements?.[id];
  if (!item) return false; if (!item.expires_date) return true;
  const expires = Date.parse(item.expires_date); return Number.isFinite(expires) && expires > timestamp;
}
function takeRateLimit(key: string, timestamp: number) {
  const limit = Number(process.env.REQUESTS_PER_HOUR || 30), hour = 3_600_000, bucket = requests.get(key);
  if (!bucket || timestamp - bucket.startedAt >= hour) { requests.set(key, { startedAt: timestamp, count: 1 }); return true; }
  bucket.count += 1; return bucket.count <= limit;
}
async function safeJSON(response: Response): Promise<any> { try { return await response.json(); } catch { return null; } }
function error(status: number, code: string, message: string) { return Response.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } }); }
const systemInstruction = `You are an expert health data analyst. Use ONLY the metrics in the provided Health Data Summary.
- Do not invent or simulate numbers not present.
- If an insight needs missing data, write "insufficient data" and list the exact aggregates needed.
- Avoid generic population statistics; tailor insights strictly to the summary and date range.
- Output concise markdown with headings and bullets; no preambles or apologies.
- Do not provide a diagnosis or replace professional medical care.`;
