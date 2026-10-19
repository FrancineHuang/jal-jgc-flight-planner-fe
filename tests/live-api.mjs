import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import ts from "typescript";

// Opt-in integration check; requires the separate backend to be running.
process.env.NEXT_PUBLIC_API_BASE_URL ||= "http://localhost:4000";
const source = await readFile(new URL("../src/lib/lsp/api.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } });
const { requestLspEstimate } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const segment = { origin: "HND", destination: "OKA", departureDate: "2026-11-01", marketingCarrier: "JL", eligibility: "eligible" };
const request = { totalAirfareJpy: 35000, segments: [segment, { ...segment, origin: "OKA", destination: "HND", departureDate: "2026-11-03" }] };

const demo = await requestLspEstimate(request);
assert.equal(demo.estimatedTotalLsp, 10);
assert.equal(demo.jpyPerLsp, 3500);
assert.deepEqual(demo.breakdown.map((item) => item.estimatedLsp), [5, 5]);
assert.equal(demo.policy.verificationStatus, "unverified");
console.log("PASS: round-trip demo → 10 demo LSP, ¥3,500/LSP, unverified policy");

const unknown = await requestLspEstimate({ ...request, segments: [segment, { ...request.segments[1], eligibility: "unknown" }] });
assert.equal(unknown.estimatedTotalLsp, null);
assert.equal(unknown.jpyPerLsp, null);
assert.equal(unknown.breakdown[0].estimatedLsp, 5);
assert.equal(unknown.breakdown[1].reason, "eligibility_unknown");
console.log("PASS: mixed known / unknown eligibility retains partial breakdown and null totals");

const zero = await requestLspEstimate({ ...request, segments: [{ ...segment, eligibility: "ineligible" }] });
assert.equal(zero.estimatedTotalLsp, 0);
assert.equal(zero.jpyPerLsp, null);
console.log("PASS: zero LSP has null cost per LSP");

const unsupported = await requestLspEstimate({ ...request, segments: [{ ...segment, destination: "LHR" }] });
assert.equal(unsupported.estimatedTotalLsp, null);
assert.equal(unsupported.breakdown[0].reason, "route_outside_policy_scope");
console.log("PASS: unsupported route stays unresolved");

await assert.rejects(requestLspEstimate({ ...request, totalAirfareJpy: -1 }), /400.*totalAirfareJpy/);
console.log("PASS: actual backend validation error is surfaced by the client");
