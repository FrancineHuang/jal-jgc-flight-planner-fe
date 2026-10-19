# JGC Flight Planner

**English** | [日本語](README.ja.md) | [简体中文](README.zh-CN.md)

A flight planning tool for JAL enthusiasts pursuing JGC — the frequent flyers known as 「修行僧」 (*shugyōsō*).

Bring your current points, personal target, planned flights and cost per point into one dashboard, so every journey has a clearer direction.

This repository contains the project's **frontend application**, built with Next.js. The interface defaults to Japanese and also supports English and Simplified Chinese.

## Background

This project is designed for travelers working toward JAL Global Club (JGC) who enjoy exploring routes and point efficiency. In this context, 「修行」 means planning flights around a frequent-flyer goal: considering where to go, how a trip contributes to that goal, and how much it will cost.

JAL's [Life Status Program](https://www.jal.co.jp/jp/ja/jmb/lsp/) is a lifetime activity program that awards Life Status Points (LSP) for flights and eligible lifestyle services. This project focuses on **flight planning**, helping travelers answer a few practical questions:

- How many LSP do I have, and how far am I from my personal target?
- How many LSP might a planned one-way or round-trip itinerary earn?
- What is the airfare cost per LSP, and how does it fit my budget?
- Which policy version produced the estimate, and which segments still need eligibility confirmation?

Starting with manual inputs and traceable estimates, the project aims to build a useful planning experience for the JGC journey. It is also a full-stack engineering portfolio project developed with AI assistance.

> This is a prototype. All flight-point calculations are **unverified demonstration estimates**, not confirmed JAL entitlements. Linking to official information does not mean the project's calculation rules have been verified. LSP and annual FLY ON Points are different concepts and must not be treated interchangeably. This is an independent project, not affiliated with Japan Airlines.

Official background: [JAL Life Status Program](https://www.jal.co.jp/jp/ja/jmb/lsp/) · [Star grade information](https://www.jal.co.jp/jp/ja/jmb/lsp/jgc/). Refer to JAL's latest published conditions for actual points, eligibility and benefits.

## Current features

| Feature | Description |
| --- | --- |
| LSP dashboard | Manually set your current LSP and personal target; view remaining points and progress |
| Flight simulator | Enter airports, dates, total airfare and marketing carrier for one-way or round-trip flights |
| Per-segment eligibility | Manually select eligible, ineligible or unknown; airports alone never determine eligibility |
| Points and cost preview | Display the backend's estimated LSP, JPY per LSP and per-segment breakdown |
| Policy transparency | Show policy ID, version, verification status and demo warnings |
| Multiple languages | Japanese, English and Simplified Chinese, with a sidebar language menu and saved preference |
| Responsive interface | Desktop and mobile layouts, with loading, empty, validation and retry states |

Current points and targets use editable demo values that reset on refresh. The language preference is saved in the current browser. Switching languages preserves entered flights and estimate results.

The prototype does not connect to JAL accounts, use a database, retrieve live airfare or verify eligibility automatically. It does not save itinerary history or search for optimal routes.

### Demo itinerary

Click 「羽田〜那覇のデモを試す」, then 「デモLSPを試算する」 in the default Japanese interface to request this example. In English, the corresponding buttons are **Try HND–OKA demo** and **Estimate demo LSP**.

| Item | Demo value |
| --- | --- |
| Itinerary | HND → OKA → HND (Haneda–Naha round trip) |
| Dates | 1–3 November 2026 |
| Marketing carrier | JL |
| Total airfare | ¥35,000 |
| Eligibility | Both segments manually marked eligible |
| Estimated points | 10 demo LSP |
| Cost per point | ¥3,500/LSP |

These results come from the backend's current **unverified demo policy**, not an official calculation example. Default balances, personal targets and the sample itinerary are configured in [`src/config/demo.ts`](src/config/demo.ts). A target shown in the interface is not a verified assessment of JGC eligibility.

Unknown eligibility or a route outside the policy scope leaves the total pending while retaining known segment results. A zero-point estimate shows an unavailable cost per point.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend framework | Next.js 16 · App Router |
| UI | React 19 · TypeScript |
| Styling | Tailwind CSS 4 · CSS · navy, white and a restrained dark-red accent |
| Localization | React Context · JSON language packs · browser-stored language preference |
| API communication | Fetch API · response validation · timeout and cancellation handling |
| Code checks | ESLint 9 · TypeScript |
| Frontend tests | Node.js built-in test runner · TypeScript compiler |
| Separate backend | Express 5 · TypeScript · Zod |

The frontend and backend are maintained in separate repositories:

- Frontend: [jal-jgc-flight-planner-fe](https://github.com/FrancineHuang/jal-jgc-flight-planner-fe)
- Backend: [jal-jgc-flight-planner-be](https://github.com/FrancineHuang/jal-jgc-flight-planner-be)

The frontend handles input, validation, interaction and presentation, calling `POST /api/v1/lsp/estimates`. The backend owns all flight LSP calculation logic; the frontend does not implement calculation formulas.

## Local setup

### 1. Prepare your environment and check out the code

The following setup uses **Node.js 24, npm and Git**. Confirm that the commands are available:

```sh
node --version
npm --version
git --version
```

For a fresh setup, clone both repositories into the same workspace:

```sh
mkdir jal-jgc-flight-planner
cd jal-jgc-flight-planner

git clone https://github.com/FrancineHuang/jal-jgc-flight-planner-fe.git
git clone https://github.com/FrancineHuang/jal-jgc-flight-planner-be.git
```

If you already have the code, use your existing directories and skip cloning. Both terminals below start from this workspace directory.

### 2. Start the backend

In the first terminal:

```sh
cd jal-jgc-flight-planner-be
npm ci
npm run dev
```

The backend defaults to `http://localhost:4000` and allows frontend requests from `http://localhost:3000`. No additional backend environment variables are needed when using these defaults.

Check the service from another terminal:

```sh
curl http://localhost:4000/api/health
```

Expected response:

```json
{ "status": "ok", "service": "JGC Flight Planner API" }
```

### 3. Configure and start the frontend

In the second terminal, run the following. The `cp` command creates the initial configuration; skip it if `.env.local` already exists and keep your current settings.

```sh
cd jal-jgc-flight-planner-fe
npm ci
cp .env.example .env.local
```

Check the API URL in `.env.local`. The default is:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Start the frontend:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the Japanese dashboard. Use the sidebar's 「表示言語」 menu to switch to English or Simplified Chinese.

You can view the page with only the frontend running. Submitting a flight estimate requires the backend to be running as well.

### Environment variables

| Application | Variable | Default/example | Purpose |
| --- | --- | --- | --- |
| Frontend | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | Backend base URL, without `/api/v1` |
| Backend | `PORT` | `4000` | Backend listening port |
| Backend | `FRONTEND_ORIGIN` | `http://localhost:3000` | Allowed frontend origin for CORS |

`NEXT_PUBLIC_API_BASE_URL` is included in browser code and must not contain secrets. After changing it, restart the frontend development server or rebuild for production. Use `.env.example` for committed configuration examples; `.env` and `.env.local` are ignored by Git.

If the frontend uses another port, match the backend's `FRONTEND_ORIGIN` to the actual frontend URL. For example, if the frontend runs at `http://localhost:3001`, restart the backend with:

```sh
FRONTEND_ORIGIN=http://localhost:3001 npm run dev
```

Run this command in the backend directory using macOS, Linux or Git Bash. `localhost` and `127.0.0.1` are also different origins, so keep the addresses consistent.

The project loads Geist through `next/font/google`; a fresh build needs access to Google Fonts.

## Development checks and builds

Run these commands in the frontend directory:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Frontend tests cover request formats, input boundaries, unknown and zero values, API errors, translation completeness, date formatting and language-preference storage.

With the backend running, you can also run a live API integration check:

```sh
npm run test:integration
```

The integration script defaults to `http://localhost:4000`. To use another address, set a process environment variable:

```sh
NEXT_PUBLIC_API_BASE_URL=http://localhost:4001 npm run test:integration
```

After a successful production build, start the production frontend with:

```sh
npm start
```

The backend must still run separately and allow the production frontend's origin.

## Directory structure

```text
src/
├── app/                       Page entry, metadata and global styles
├── components/
│   ├── dashboard/             Dashboard, point settings and language menu
│   ├── simulator/             Flight form, request states and estimate results
│   └── ui/                    Shared icons
├── config/demo.ts             Demo balance, target and itinerary
├── i18n/
│   ├── messages/              ja.json, en.json and zh.json
│   ├── dictionaries.ts        Message types and interpolation
│   ├── locale-provider.tsx    Language context and page-language synchronization
│   └── locale-store.ts        Browser language preference
└── lib/
    ├── lsp/                   API types, requests and input validation
    └── format.ts              Number, JPY and date formatting
tests/                         Unit tests and live API integration script
```

Read [`AGENTS.md`](AGENTS.md) before development and preserve its generated Next.js instructions. For the API contract and policy configuration, see the [backend README](https://github.com/FrancineHuang/jal-jgc-flight-planner-be#readme).
