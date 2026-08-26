import assert from "node:assert/strict";
import test from "node:test";

process.env.OPENROUTER_API_KEY = "test-openrouter";
process.env.REVENUECAT_SECRET_API_KEY = "test-revenuecat";
process.env.OPENROUTER_OPENAI_MODEL = "openai/test";
process.env.OPENROUTER_ANTHROPIC_MODEL = "anthropic/test";
import { handleAnalysis } from "../src/lib/ai-proxy";
const now = () => Date.parse("2026-08-26T00:00:00Z");
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const request = (user = "user", provider = "openai") => new Request("http://localhost/v1/ai-analysis", { method: "POST", headers: { "Content-Type": "application/json", "X-RevenueCat-App-User-ID": user }, body: JSON.stringify({ provider, prompt: "Analyze", health_summary: "Steps: 100" }) });

test("requires subscription identity", async () => {
  const result = await handleAnalysis(new Request("http://localhost", { method: "POST", body: "{}" }));
  assert.equal(result.status, 401);
});

test("rejects inactive subscriptions", async () => {
  const result = await handleAnalysis(request(), { now, fetchImpl: async () => json(200, { subscriber: { entitlements: {} } }) });
  assert.equal(result.status, 403);
});

test("routes paid OpenAI requests through configured OpenRouter model", async () => {
  const calls: Array<{ url: string; options?: RequestInit }> = [];
  const result = await handleAnalysis(request("paid-user"), { now, fetchImpl: async (input, options) => {
    const url = input.toString(); calls.push({ url, options });
    if (url.includes("revenuecat")) return json(200, { subscriber: { entitlements: { Pro: { expires_date: "2026-09-26T00:00:00Z" } } } });
    return json(200, { choices: [{ message: { content: "Useful analysis" } }] });
  }});
  assert.equal(result.status, 200);
  const upstream = JSON.parse(calls[1].options?.body as string);
  assert.equal(upstream.model, "openai/test");
  assert.equal((calls[1].options?.headers as Record<string,string>).Authorization, "Bearer test-openrouter");
});

test("uses current built-in models when Railway overrides are absent", async () => {
  const openAIOverride = process.env.OPENROUTER_OPENAI_MODEL;
  const anthropicOverride = process.env.OPENROUTER_ANTHROPIC_MODEL;
  delete process.env.OPENROUTER_OPENAI_MODEL;
  delete process.env.OPENROUTER_ANTHROPIC_MODEL;
  try {
    const models: string[] = [];
    const fetchImpl = async (input: URL | RequestInfo, options?: RequestInit) => {
      if (input.toString().includes("revenuecat")) return json(200, { subscriber: { entitlements: { Pro: { expires_date: null } } } });
      models.push(JSON.parse(options?.body as string).model);
      return json(200, { choices: [{ message: { content: "Useful analysis" } }] });
    };
    assert.equal((await handleAnalysis(request("default-openai"), { now, fetchImpl })).status, 200);
    assert.equal((await handleAnalysis(request("default-anthropic", "anthropic"), { now, fetchImpl })).status, 200);
    assert.deepEqual(models, ["openai/gpt-5.6-sol", "anthropic/claude-opus-5"]);
  } finally {
    process.env.OPENROUTER_OPENAI_MODEL = openAIOverride;
    process.env.OPENROUTER_ANTHROPIC_MODEL = anthropicOverride;
  }
});

test("does not expose provider errors", async () => {
  const result = await handleAnalysis(request("other-user", "anthropic"), { now, fetchImpl: async input => input.toString().includes("revenuecat") ? json(200, { subscriber: { entitlements: { Pro: { expires_date: null } } } }) : json(402, { error: { message: "secret detail" } }) });
  assert.equal(result.status, 502);
  assert.doesNotMatch(await result.text(), /secret detail/);
});
