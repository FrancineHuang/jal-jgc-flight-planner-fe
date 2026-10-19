import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import ts from "typescript";

const packs = Object.fromEntries(await Promise.all(["ja", "en", "zh"].map(async (locale) => [
  locale, JSON.parse(await readFile(new URL(`../src/i18n/messages/${locale}.json`, import.meta.url), "utf8")),
])));

async function loadTypeScript(path, inlineJson = false) {
  let source = await readFile(new URL(path, import.meta.url), "utf8");
  if (inlineJson) {
    for (const [locale, messages] of Object.entries(packs)) {
      source = source.replace(`import ${locale} from "./messages/${locale}.json";`, `const ${locale} = ${JSON.stringify(messages)};`);
    }
  }
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const { createTranslator } = await loadTypeScript("../src/i18n/dictionaries.ts", true);
const { validateItinerary } = await loadTypeScript("../src/lib/lsp/validation.ts");
const { formatDate, formatJpy } = await loadTypeScript("../src/lib/format.ts");
const store = await loadTypeScript("../src/i18n/locale-store.ts");
const originalWindow = globalThis.window;
afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

test("all language packs have the same nonempty keys and interpolation parameters", () => {
  const keys = Object.keys(packs.ja).sort();
  const parameters = (message) => [...message.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const [locale, messages] of Object.entries(packs)) {
    assert.deepEqual(Object.keys(messages).sort(), keys, `${locale}: complete dictionary`);
    for (const key of keys) {
      assert.ok(typeof messages[key] === "string" && messages[key].trim(), `${locale}.${key}`);
      assert.deepEqual(parameters(messages[key]), parameters(packs.ja[key]), `${locale}.${key}: interpolation variables`);
    }
  }
});

test("translations interpolate dynamic progress and counts in each language", () => {
  for (const locale of ["ja", "en", "zh"]) {
    const t = createTranslator(packs[locale]);
    const progress = t("progress.accessible", { current: "860", target: "1,500", progress: "57.3" });
    assert.match(progress, /860/);
    assert.match(progress, /1,500/);
    assert.match(progress, /57\.3/);
    assert.doesNotMatch(progress, /\{\w+\}/);
    assert.match(t("result.segmentCount", { count: 2 }), /2/);
  }
});

test("existing validation errors can change language without changing inputs or validating again", () => {
  const errors = validateItinerary({ tripType: "round-trip", origin: "HND", destination: "HND", outboundDate: "", returnDate: "", marketingCarrier: "JL", airfare: "", outboundEligibility: "unknown", returnEligibility: "unknown" });
  assert.equal(errors.destination, "validation.destination");
  assert.equal(errors.airfare, "validation.airfare");
  for (const messages of Object.values(packs)) {
    const t = createTranslator(messages);
    for (const key of Object.values(errors)) assert.equal(t(key), messages[key]);
  }
  assert.notEqual(createTranslator(packs.ja)(errors.destination), createTranslator(packs.en)(errors.destination));
});

test("date formatting follows language while preserving the calendar date and JPY currency", () => {
  assert.equal(formatDate("2026-11-01", "ja"), "2026年11月01日");
  assert.equal(formatDate("2026-11-01", "en"), "01 Nov 2026");
  assert.equal(formatDate("2026-11-01", "zh"), "2026年11月01日");
  for (const locale of ["ja", "en", "zh"]) {
    assert.match(formatJpy(3500, locale), /[¥￥]3,500/);
    assert.match(formatJpy(0, locale), /[¥￥]0/);
  }
});

test("Japanese is the default; stored choices persist and notify subscribers", () => {
  const values = new Map();
  const browser = new EventTarget();
  browser.localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  globalThis.window = browser;
  assert.equal(store.getServerLocale(), "ja");
  assert.equal(store.getLocale(), "ja");
  let changes = 0;
  const unsubscribe = store.subscribeLocale(() => changes++);
  store.setLocale("zh");
  assert.equal(store.getLocale(), "zh");
  assert.equal(values.get(store.LOCALE_STORAGE_KEY), "zh");
  assert.equal(changes, 1);
  const externalChange = new Event("storage");
  Object.defineProperty(externalChange, "key", { value: store.LOCALE_STORAGE_KEY });
  values.set(store.LOCALE_STORAGE_KEY, "en");
  browser.dispatchEvent(externalChange);
  assert.equal(store.getLocale(), "en");
  assert.equal(changes, 2);
  values.set(store.LOCALE_STORAGE_KEY, "unsupported");
  assert.equal(store.getLocale(), "ja");
  unsubscribe();
  browser.dispatchEvent(externalChange);
  assert.equal(changes, 2);
});

test("language switching still works when localStorage is blocked", () => {
  const browser = new EventTarget();
  Object.defineProperty(browser, "localStorage", { get() { throw new Error("Storage unavailable"); } });
  globalThis.window = browser;
  assert.doesNotThrow(() => store.setLocale("en"));
  assert.equal(store.getLocale(), "en");
  store.setLocale("ja");
});
