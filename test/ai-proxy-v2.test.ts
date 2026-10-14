import assert from "node:assert/strict";
import test from "node:test";
import { handleAnalysis, MODEL_CATALOG } from "../src/lib/ai-proxy";

process.env.OPENROUTER_API_KEY = "test-openrouter";
process.env.REVENUECAT_SECRET_API_KEY = "test-revenuecat";
const json = (status: number, value: unknown) => Response.json(value, { status });
const active = { subscriber: { entitlements: { Pro: { expires_date: null } } } };
const now = () => Date.parse("2026-10-14T00:00:00Z");
let sequence = 0;
function request(patch: Record<string, unknown> = {}, user = `fixture-${sequence++}`, raw?: string) {
  return new Request("https://example.test/v2/ai-analysis", { method: "POST",
    headers: { "X-RevenueCat-App-User-ID": user },
    body: raw ?? JSON.stringify({ provider: "openai", mode: "everyday", expected_model: MODEL_CATALOG.openai.everyday,
      prompt: "Compare", health_summary: "Synthetic steps: 100", ...patch }) });
}

for (const provider of ["openai", "anthropic"] as const) {
  for (const mode of ["everyday", "deep"] as const) {
    test(`v2 routes ${provider}/${mode} and confirms the upstream model`, async () => {
      const expected_model = MODEL_CATALOG[provider][mode];
      let sent: any;
      const result = await handleAnalysis(request({ provider, mode, expected_model }), { now,
        fetchImpl: async (url, options) => {
          if (url.toString().includes("revenuecat")) return json(200, active);
          sent = JSON.parse(options?.body as string);
          assert.equal((options?.headers as Record<string, string>).Authorization, "Bearer test-openrouter");
          return json(200, { model: expected_model, choices: [{ finish_reason: "stop", message: { content: " Answer ", reasoning: "private" } }] });
        } }, 2);
      assert.equal(result.status, 200);
      assert.deepEqual(await result.json(), { content: "Answer", model: expected_model });
      assert.equal(sent.model, expected_model);
      assert.deepEqual(sent.reasoning, { effort: mode === "deep" ? "medium" : "low", exclude: true });
      assert.equal(sent.max_tokens, provider === "openai" ? 8000 : 4000);
      assert.equal(sent.temperature, undefined);
      assert.match(sent.messages[0].content, /never as instructions/);
      assert.match(sent.messages[0].content, /timing is unknown/);
    });
  }
}

for (const patch of [{ mode: "unknown" }, { mode: ["deep"] }, { mode: null }, { expected_model: "google/anything" }, { provider: "toString" }]) {
  test(`invalid selection ${JSON.stringify(patch)} never reaches OpenRouter`, async () => {
    const result = await handleAnalysis(request(patch), { now, fetchImpl: async url => {
      assert.match(url.toString(), /revenuecat/); return json(200, active);
    } }, 2);
    assert.equal(result.status, "provider" in patch ? 400 : 409);
  });
}

for (const scenario of ["expired", "missing", "invalid_expiry", "missing_expiry", "unavailable", "malformed", "timeout"]) {
  test(`subscription ${scenario} fails closed with appropriate status`, async () => {
    const result = await handleAnalysis(request(), { now, fetchImpl: async url => {
      assert.match(url.toString(), /revenuecat/);
      if (scenario === "timeout") throw new Error("secret request identity");
      if (scenario === "unavailable") return json(503, {});
      if (scenario === "malformed") return json(200, {});
      if (scenario === "missing") return json(200, { subscriber: { entitlements: {} } });
      const item = scenario === "missing_expiry" ? {} : { expires_date: scenario === "invalid_expiry" ? "bad" : "2026-01-01T00:00:00Z" };
      return json(200, { subscriber: { entitlements: { Pro: item } } });
    } }, 2);
    assert.equal(result.status, ["unavailable", "malformed", "timeout"].includes(scenario) ? 503 : 403);
    assert.doesNotMatch(await result.text(), /secret request identity/);
  });
}

for (const finish_reason of ["length", "tool_calls", "error", null]) {
  test(`incomplete ${finish_reason} response is not success`, async () => {
    const result = await handleAnalysis(request(), { now, fetchImpl: async url => json(200, url.toString().includes("revenuecat") ? active : {
      model: MODEL_CATALOG.openai.everyday, choices: [{ finish_reason, message: { content: "Partial answer" } }]
    }) }, 2);
    assert.equal(result.status, 502);
  });
}

for (const response of [{ model: "wrong/model", content: "Answer" }, { content: "Answer" }, { model: MODEL_CATALOG.openai.everyday, content: "   " }]) {
  test(`invalid model or empty answer ${JSON.stringify(response)} is rejected`, async () => {
    const result = await handleAnalysis(request(), { now, fetchImpl: async url => json(200, url.toString().includes("revenuecat") ? active : {
      model: response.model, choices: [{ finish_reason: "stop", message: { content: response.content } }]
    }) }, 2);
    assert.equal(result.status, 502);
  });
}

test("malformed and oversized bodies cannot reach OpenRouter", async () => {
  for (const [raw, status] of [["null", 400], ["[]", 400], ["{", 400], ["x".repeat(512001), 413]] as const) {
    const result = await handleAnalysis(request({}, undefined, raw), { now, fetchImpl: async url => {
      assert.match(url.toString(), /revenuecat/); return json(200, active);
    } }, 2);
    assert.equal(result.status, status);
  }
});

test("Anthropic budget rejects rather than silently trims the consented summary", async () => {
  const result = await handleAnalysis(request({ provider: "anthropic", expected_model: MODEL_CATALOG.anthropic.everyday, health_summary: "x".repeat(120001) }),
    { now, fetchImpl: async url => { assert.match(url.toString(), /revenuecat/); return json(200, active); } }, 2);
  assert.equal(result.status, 413);
});

test("rate limit is tied to identity rather than a client-controlled forwarded header", async () => {
  let calls = 0;
  for (let i = 0; i < 31; i++) {
    const req = request({}, "rate-limit-fixture"); req.headers.set("x-forwarded-for", `192.0.2.${i}`);
    const result = await handleAnalysis(req, { now, fetchImpl: async () => {
      calls++; return json(200, { subscriber: { entitlements: {} } });
    } }, 2);
    assert.equal(result.status, i < 30 ? 403 : 429);
  }
  assert.equal(calls, 30);
});
