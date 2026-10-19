import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import ts from "typescript";

// Use the existing TypeScript compiler to run dependency-free Node 20 tests.
// These pure modules import types only; no bundler, DOM or application server is needed.
async function loadTypeScript(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:4000/";
const { requestLspEstimate, isLspEstimate, LspApiError } = await loadTypeScript("../src/lib/lsp/api.ts");
const { validateItinerary, toEstimateRequest } = await loadTypeScript("../src/lib/lsp/validation.ts");
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const demo = {
  tripType: "round-trip", origin: "HND", destination: "OKA",
  outboundDate: "2026-11-01", returnDate: "2026-11-03",
  marketingCarrier: "JL", airfare: "35000",
  outboundEligibility: "eligible", returnEligibility: "eligible",
};

// Response fixture from the backend's documented demo, not a client calculation.
const response = {
  totalAirfareJpy: 35000, estimatedTotalLsp: 10, jpyPerLsp: 3500,
  breakdown: toEstimateRequest(demo).segments.map((segment, segmentIndex) => ({
    ...segment, segmentIndex, estimatedLsp: 5, reason: "eligible_domestic_demo",
  })),
  policy: {
    id: "jgc-domestic-demo", version: "1.0.0", verificationStatus: "unverified",
    usage: "demonstration_only", lspPerEligibleDomesticSegment: 5,
    domesticAirports: ["HND", "NRT", "OKA", "ITM", "KIX", "CTS", "FUK", "NGO"],
  },
  warnings: ["Unverified demonstration data only."],
};

test("round trip retains per-segment eligibility and dates; unknown is accepted", () => {
  const input = { ...demo, origin: " hnd ", destination: "oka", returnEligibility: "unknown" };
  assert.deepEqual(validateItinerary(input), {});
  const request = toEstimateRequest(input);
  assert.equal(request.totalAirfareJpy, 35000);
  assert.deepEqual(request.segments[1], { origin: "OKA", destination: "HND", departureDate: "2026-11-03", marketingCarrier: "JL", eligibility: "unknown" });
});

test("one-way omits the unused return date and return eligibility", () => {
  const input = { ...demo, tripType: "one-way", returnDate: "", returnEligibility: "unknown", airfare: "0" };
  assert.deepEqual(validateItinerary(input), {});
  assert.equal(toEstimateRequest(input).segments.length, 1);
  assert.equal(toEstimateRequest(input).totalAirfareJpy, 0);
});

test("rejects empty, fractional, negative and unsafe fares, duplicate airports and invalid dates", () => {
  for (const airfare of ["", "-1", "1.5", "1e3", "9007199254740992"]) assert.ok(validateItinerary({ ...demo, airfare }).airfare);
  assert.ok(validateItinerary({ ...demo, destination: "HND" }).destination);
  assert.ok(validateItinerary({ ...demo, origin: "HD" }).origin);
  assert.ok(validateItinerary({ ...demo, marketingCarrier: "JAL" }).marketingCarrier);
  assert.ok(validateItinerary({ ...demo, outboundDate: "2026-02-30" }).outboundDate);
  assert.ok(validateItinerary({ ...demo, returnDate: "2026-10-31" }).returnDate);
});

test("posts the backend contract to the configured URL and returns its values untouched", async () => {
  const request = toEstimateRequest(demo);
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "http://localhost:4000/api/v1/lsp/estimates");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), request);
    return Response.json(response);
  };
  assert.deepEqual(await requestLspEstimate(request), response);
});

test("preserves null and zero estimates without substituting or dividing values", async () => {
  for (const payload of [
    { ...response, estimatedTotalLsp: null, jpyPerLsp: null, breakdown: [{ ...response.breakdown[0], eligibility: "unknown", estimatedLsp: null, reason: "eligibility_unknown" }] },
    { ...response, estimatedTotalLsp: null, jpyPerLsp: null, breakdown: [{ ...response.breakdown[0], estimatedLsp: null, reason: "route_outside_policy_scope" }] },
    { ...response, estimatedTotalLsp: 0, jpyPerLsp: null, breakdown: [{ ...response.breakdown[0], eligibility: "ineligible", estimatedLsp: 0, reason: "ineligible" }] },
    { ...response, totalAirfareJpy: 0, jpyPerLsp: 0 },
  ]) {
    globalThis.fetch = async () => Response.json(payload);
    assert.deepEqual(await requestLspEstimate(toEstimateRequest(demo)), payload);
  }
});

test("surfaces backend validation paths and handles non-JSON HTTP errors", async () => {
  globalThis.fetch = async () => Response.json({ error: { code: "VALIDATION_ERROR", message: "Invalid LSP estimate request", issues: [{ path: ["segments", 0, "departureDate"], message: "Invalid date" }] } }, { status: 400 });
  await assert.rejects(requestLspEstimate(toEstimateRequest(demo)), /400.*segments\.0\.departureDate: Invalid date/);
  await assert.rejects(requestLspEstimate(toEstimateRequest(demo)), (error) => error instanceof LspApiError && error.kind === "http" && error.status === 400);
  globalThis.fetch = async () => new Response("Service unavailable", { status: 503 });
  await assert.rejects(requestLspEstimate(toEstimateRequest(demo)), /503/);
});

test("rejects malformed or incompatible policies instead of rendering them", async () => {
  assert.equal(isLspEstimate({ ...response, policy: { ...response.policy, verificationStatus: "verified" } }), false);
  assert.equal(isLspEstimate({ ...response, breakdown: [{ ...response.breakdown[0], departureDate: "invalid" }] }), false);
  assert.equal(isLspEstimate({ ...response, jpyPerLsp: Infinity }), false);
  globalThis.fetch = async () => Response.json({ unexpected: true });
  await assert.rejects(requestLspEstimate(toEstimateRequest(demo)), /unsupported estimate format/);
  globalThis.fetch = async () => new Response("not JSON");
  await assert.rejects(requestLspEstimate(toEstimateRequest(demo)), /unsupported estimate format/);
});

test("network failure has a useful error and caller cancellation remains cancellable", async () => {
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  await assert.rejects(requestLspEstimate(toEstimateRequest(demo)), /Cannot reach the estimate API/);
  await assert.rejects(requestLspEstimate(toEstimateRequest(demo)), (error) => error instanceof LspApiError && error.kind === "network");
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_url, options) => { options.signal.throwIfAborted(); };
  await assert.rejects(requestLspEstimate(toEstimateRequest(demo), controller.signal), { name: "AbortError" });
});
