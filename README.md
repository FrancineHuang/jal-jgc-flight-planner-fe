# JGC Flight Planner — Frontend

Next.js 16 App Router, React 19, TypeScript and Tailwind CSS. A responsive dashboard and flight simulator with navy, white and a restrained dark-red accent (`#8f263b`). Independent prototype, not affiliated with Japan Airlines.

## Run locally

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Start the separate Express backend on http://localhost:4000 in its own repository (`npm run dev`). The backend must allow the frontend origin through CORS; its default is `http://localhost:3000`.

`NEXT_PUBLIC_API_BASE_URL` is the backend origin, without `/api/v1`. It is embedded in the browser bundle; restart development or rebuild production after changing it. No secrets belong in this variable. The original template uses `next/font/google` for Geist, which requires access to Google Fonts during a fresh build.

## Dashboard & simulator

The default interface language is **Japanese**. Use the language menu in the sidebar to switch between **日本語**, **English** and **简体中文**. The selection is stored in this browser and synchronized between tabs. Changing language preserves form inputs, manual balance settings and estimate results; only point settings reset on refresh. If browser storage is blocked, language switching still works for the current page session.

All interface strings, accessible labels, validation messages, known API warnings and error states use `src/i18n/messages/ja.json`, `en.json` and `zh.json`. Dates, page title, description and the HTML language follow the selection. Airport/carrier codes, policy IDs and versions stay as provided by the API; unexpected additional backend warnings are preserved verbatim. API errors carry a stable category so the UI can translate them without parsing English error text.

- Edit current LSP and a personal target using **Edit LSP & target**. Defaults are configured in `src/config/demo.ts`. These are demo planning values, not account data or a verified JGC threshold. Changes last for the current page session and reset on refresh.
- Choose a one-way or round-trip itinerary; enter IATA airport codes, dates, total JPY airfare and the marketing carrier (applied to each segment). Eligibility is manually configurable for each segment and defaults to **Unknown**.
- **Try HND–OKA demo** loads the explicit example: 1–3 November 2026, ¥35,000, two manually eligible JL segments. Click **Estimate demo LSP** to request the result. With the backend's current unverified policy, it returns 10 demo LSP and ¥3,500 per LSP.
- The UI displays the backend's total, cost per point, segment reasons, policy ID/version, verification status and warnings. No flight LSP calculation formulas are implemented in the frontend.
- Unknown eligibility and unsupported routes show a pending total while preserving available segment estimates. Zero LSP shows an unavailable cost per LSP, never infinity. Free airfare remains valid. Costs are rounded to the nearest yen for display only.
- Editing inputs clears the previous estimate. Loading, inline validation, API errors with retry, request timeout and empty results have dedicated states. Submissions are disabled while a request is pending.

All flight estimates are **unverified demonstration data only**, never confirmed JAL entitlements. Life Status Points are separate from annual FLY ON Points. There is no authentication, database, persistence, airfare lookup or eligibility verification.

## Structure

```text
src/app/                       App Router entry, metadata and responsive styles
src/components/dashboard/      Dashboard shell, manual settings and progress
src/components/simulator/      Flight form, request lifecycle and estimate display
src/components/ui/             Shared SVG icons
src/config/demo.ts             Configurable demo balance, target and itinerary
src/i18n/                      Typed dictionaries, locale provider and browser preference
src/lib/lsp/types.ts           Actual Express request/response contract
src/lib/lsp/api.ts             POST client, response guard, errors, timeout/cancellation
src/lib/lsp/validation.ts      Input validation and request serialization only
src/lib/format.ts              Number, currency and timezone-stable date formatting
tests/                         Client/validation tests and opt-in live API check
```

`POST /api/v1/lsp/estimates` accepts `{ totalAirfareJpy, segments }`. Each segment contains `origin`, `destination`, `departureDate`, `marketingCarrier`, and `eligibility` (`eligible | ineligible | unknown`). The response contains `totalAirfareJpy`, nullable `estimatedTotalLsp` and `jpyPerLsp`, `breakdown`, `policy`, and `warnings`. API errors use `error.message` and optional `error.issues` with field paths.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build

# Optional: with the backend running on localhost:4000
npm run test:integration
```

Tests use the existing TypeScript compiler and Node test runner, with no added packages. Localization checks cover matching dictionary keys and interpolation parameters, translated validation, locale formatting, saved preferences and blocked browser storage. Integration checks exercise the frontend API client against the actual backend, including demo, unknown, zero, unsupported-route and validation-error responses.

Keep the generated Next.js instructions in `AGENTS.md` intact. The frontend and backend repositories remain separate.
