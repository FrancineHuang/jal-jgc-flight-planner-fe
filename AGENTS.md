<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# JGC Flight Planner — Project Instructions

## Product Overview

JGC Flight Planner is a full-stack web application for Japan Airlines frequent flyers.

Its purpose is to help users track Life Status Points (LSP), estimate points from planned flights, compare itinerary costs, and plan progress toward JGC eligibility.

This is an engineering portfolio project developed using AI-assisted coding.

## Existing Repositories

- Frontend: `FrancineHuang/jal-jgc-flight-planner-fe`
  - Next.js 16, React 19, TypeScript, Tailwind CSS
  - Runs on `localhost:3000`
- Backend: `FrancineHuang/jal-jgc-flight-planner-be`
  - Node.js 24, Express 5, TypeScript, ESM
  - Runs on `localhost:4000`

The repositories must remain separate.

## MVP Features

1. LSP calculation REST API
2. Flight simulator for one-way and round-trip itineraries
3. Fare and JPY-per-LSP cost analysis
4. Dashboard showing manually entered current LSP, a configurable target and remaining points
5. Calculation breakdown and policy source status
6. Input validation and automated tests

## Business Rules

- Life Status Points and annual FLY ON Points are different concepts.
- Never assume a flight is eligible based on its airports alone.
- JAL policies must be configurable and versioned.
- Current official LSP rules have not yet been independently verified for this project.
- For the initial prototype only, use an explicitly unverified demo rule of 5 LSP per eligible domestic segment.
- Demo scenario: HND → OKA → HND, ¥35,000 total fare, two manually eligible segments, 10 demo LSP, ¥3,500 per LSP.
- Unknown eligibility must not be treated as zero or confirmed eligible.
- A zero-point estimate must not produce an infinite cost-per-point value.
- Never display simulated values as confirmed official JAL entitlements.

## API Contract

Initial endpoint: `POST /api/v1/lsp/estimates`

Backend owns all LSP calculation logic. Frontend consumes the API and displays results.

## Development Principles

- Inspect existing code before modifying it.
- Preserve existing functionality and project configuration.
- Implement incrementally with small, reviewable changes.
- Prefer strict TypeScript types and clear separation of concerns.
- Add unit tests for calculation rules and edge cases.
- Do not add authentication, database persistence or live flight pricing in the first iteration.
- Run available checks and report results.
- Do not modify both repositories unless explicitly asked.
- Explain technical decisions and important changes to the developer.
