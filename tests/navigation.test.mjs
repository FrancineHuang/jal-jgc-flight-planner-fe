import assert from "node:assert/strict";
import { test } from "node:test";
import { createPlannerRenderer } from "./helpers/render-planner.mjs";

const paths = ["/dashboard", "/simulator", "/policies"];
const routeFile = (path) => `src/app/(planner)${path}/page.tsx`;
const estimate = {
  totalAirfareJpy: 35000, estimatedTotalLsp: 10, jpyPerLsp: 3500,
  breakdown: [
    { origin: "HND", destination: "OKA", departureDate: "2026-11-01", marketingCarrier: "JL", eligibility: "eligible", segmentIndex: 0, estimatedLsp: 5, reason: "eligible_domestic_demo" },
    { origin: "OKA", destination: "HND", departureDate: "2026-11-03", marketingCarrier: "JL", eligibility: "eligible", segmentIndex: 1, estimatedLsp: 5, reason: "eligible_domestic_demo" },
  ],
  policy: { id: "backend-policy-test", version: "7.2.0", verificationStatus: "unverified", usage: "demonstration_only", lspPerEligibleDomesticSegment: 9, domesticAirports: ["HND", "OKA", "ABC"] },
  warnings: ["Unverified demonstration data only. This estimate does not represent verified JAL LSP rules. Eligibility is supplied manually and is not verified."],
};

test("the root route redirects to /dashboard through Next.js", () => {
  const { load } = createPlannerRenderer();
  const Home = load("src/app/page.tsx").default;
  assert.throws(() => Home(), (error) => error.digest?.startsWith("NEXT_REDIRECT;replace;/dashboard;"));
});

test("all sidebar links are real routes with exactly one active item in each language", () => {
  for (const locale of ["ja", "en", "zh"]) {
    for (const pathname of paths) {
      const html = createPlannerRenderer({ pathname, locale }).renderSidebar();
      const activeLinks = html.match(/<a\b[^>]*aria-current="page"[^>]*>/g) ?? [];
      assert.equal(activeLinks.length, 1);
      assert.ok(activeLinks[0].includes(`href="${pathname}"`));
      for (const path of paths) assert.ok(html.includes(`href="${path}"`));
      assert.doesNotMatch(html, /href="#(?:overview|simulator|policy)"/);
    }
  }
});

test("dashboard renders progress and a simulator link without embedding the flight form", () => {
  const renderer = createPlannerRenderer();
  const html = renderer.render(routeFile("/dashboard"));
  assert.match(html, /role="progressbar"/);
  assert.match(html, /860/);
  assert.match(html, /1,500/);
  assert.match(html, /640/);
  assert.match(html, /id="planning-title"/);
  assert.match(html, /href="\/simulator"/);
  assert.doesNotMatch(html, /name="(?:origin|airfare|outboundDate)"/);
  assert.doesNotMatch(html, /id="estimate-title"/);
  assert.equal((html.match(/<aside\b/g) ?? []).length, 1);
  assert.equal((html.match(/<main\b/g) ?? []).length, 1);
  assert.equal((html.match(/<footer\b/g) ?? []).length, 1);
  assert.equal(renderer.providerCount(), 1);
});

test("dashboard summarizes the backend's last estimate, preserving unresolved totals", () => {
  for (const total of [10, null, 0]) {
    const renderer = createPlannerRenderer();
    renderer.context.simulation.lastEstimate = { ...estimate, estimatedTotalLsp: total, jpyPerLsp: total ? 3500 : null };
    const html = renderer.render(routeFile("/dashboard"));
    assert.match(html, /HND → OKA → HND/);
    assert.match(html, /35,000/);
    assert.ok(html.includes(total === null ? "Pending" : `+${total} LSP`));
    assert.doesNotMatch(html, /Infinity/);
    assert.doesNotMatch(html, /name="origin"/);
  }
});

test("simulator has its own heading, all flight fields and the existing result panel", () => {
  const renderer = createPlannerRenderer({ pathname: "/simulator" });
  const html = renderer.render(routeFile("/simulator"));
  assert.match(html, /<h1 id="simulator-title"/);
  for (const name of ["origin", "destination", "outboundDate", "returnDate", "airfare", "marketingCarrier", "outboundEligibility", "returnEligibility"]) {
    assert.ok(html.includes(`name="${name}"`), name);
  }
  assert.match(html, /id="estimate-title"/);
  assert.doesNotMatch(html, /role="progressbar"/);
  assert.doesNotMatch(html, /id="planning-title"/);
});

test("policies shows the actual returned policy fields and localized methodology without a simulator", () => {
  for (const locale of ["ja", "en", "zh"]) {
    const renderer = createPlannerRenderer({ pathname: "/policies", locale, planner: { policySnapshot: estimate } });
    const html = renderer.render(routeFile("/policies"));
    assert.match(html, /<h1 id="policies-title"/);
    assert.match(html, /backend-policy-test/);
    assert.match(html, /7\.2\.0/);
    assert.match(html, /ABC/);
    assert.ok(html.includes(renderer.t("policies.segmentMethod", { points: 9 })));
    assert.ok(html.includes(renderer.t("common.unverified")));
    assert.ok(html.includes(renderer.t("policy.warning")));
    assert.doesNotMatch(html, /name="origin"|role="progressbar"/);
  }
});

test("a direct policy visit waits for the backend instead of displaying an invented policy", () => {
  const html = createPlannerRenderer({ pathname: "/policies" }).render(routeFile("/policies"));
  assert.match(html, /role="status"/);
  assert.match(html, /Loading the current demo policy/);
  assert.doesNotMatch(html, /jgc-domestic-demo|7\.2\.0|1\.0\.0/);
});
