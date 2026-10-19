import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const root = fileURLToPath(new URL("../../", import.meta.url));
const nativeRequire = createRequire(new URL("../../package.json", import.meta.url));
const packs = Object.fromEntries(["ja", "en", "zh"].map((locale) => [locale, JSON.parse(readFileSync(resolve(root, `src/i18n/messages/${locale}.json`), "utf8"))]));

// Render the actual route/components using the installed React and Next Link.
// Only browser pathname and provider values are injected; effects do not run in SSR.
export function createPlannerRenderer({ pathname = "/dashboard", locale = "en", planner = {} } = {}) {
  const cache = new Map();
  let providers = 0;
  const t = (key, values) => packs[locale][key].replace(/\{(\w+)\}/g, (placeholder, name) => String(values?.[name] ?? placeholder));
  const context = {
    balance: { currentLsp: 860, targetLsp: 1500 }, setBalance() {},
    simulation: {
      input: { tripType: "round-trip", origin: "HND", destination: "OKA", outboundDate: "", returnDate: "", airfare: "", marketingCarrier: "JL", outboundEligibility: "unknown", returnEligibility: "unknown" },
      errors: {}, state: { status: "idle" }, lastEstimate: null,
      update() {}, loadDemo() {}, swapAirports() {}, async estimate() { return true; },
    },
    policySnapshot: null, recordPolicy() {}, ...planner,
  };
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith(".json")) return JSON.parse(readFileSync(filename, "utf8"));
    const loadedModule = { exports: {} };
    cache.set(filename, loadedModule);
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } });
    function requireModule(specifier) {
      if (specifier.endsWith(".css")) return {};
      if (specifier === "next/navigation") return { ...nativeRequire(specifier), usePathname: () => pathname };
      if (specifier === "@/i18n/locale-provider") return { useI18n: () => ({ locale, t, setLocale() {} }) };
      if (specifier === "@/components/planner/planner-provider") return {
        usePlanner: () => context,
        PlannerProvider: ({ children }) => { providers++; return children; },
      };
      if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return nativeRequire(specifier);
      const base = specifier.startsWith("@/") ? resolve(root, "src", specifier.slice(2)) : resolve(dirname(filename), specifier);
      const target = [base, `${base}.ts`, `${base}.tsx`, `${base}.json`].find((candidate) => existsSync(candidate));
      if (!target) throw new Error(`Cannot resolve ${specifier} from ${filename}`);
      return load(target);
    }
    const execute = new Function("require", "module", "exports", outputText);
    execute(requireModule, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return {
    context, t,
    load: (path) => load(resolve(root, path)),
    render(path) {
      const Page = load(resolve(root, path)).default;
      const Layout = load(resolve(root, "src/app/(planner)/layout.tsx")).default;
      return renderToStaticMarkup(createElement(Layout, null, createElement(Page)));
    },
    renderSidebar() { return renderToStaticMarkup(createElement(load(resolve(root, "src/components/layout/sidebar.tsx")).Sidebar)); },
    providerCount: () => providers,
  };
}
