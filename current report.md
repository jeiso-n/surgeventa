# Surgevanta — Current Project Report

**Last Updated:** 2026-11-26  
**Active Milestone:** Milestone 1 — Project Discovery & Foundation  
**Status:** **Completed & verified on GitHub** (`origin/main`)  
**ChatGPT Independent Review Verdict:** Pending review

---

## 1. Objective & Current State

Surgevanta is a self-controlled, zero-spending unified social media publishing workspace built for portability across PostgreSQL (Neon Free Tier) and standard Node/Next.js hosting.

Milestone 1 established the clean engineering foundation, verified Neon PostgreSQL and all 9 target social platform API rules against current documentation, built the initial design system and honest workspace dashboard shell, configured server-side security primitives (AES-256-GCM token encryption and Zod environment readiness checks), and added automated checks.

No Neon credentials have been invented or connected yet, and no fake integrations or placeholder metrics exist.

---

## 2. Verified Environment & Stack

- **Repository Path:** `d:\Projects\surgeventa`
- **OS:** Windows (PowerShell)
- **Node.js:** `v26.13.0` | **npm:** `11.20.0` | **Git:** `2.56.0.windows.4` | **Docker:** `29.9.2`
- **Framework:** Next.js `16.4.6` (App Router, Cache Components + Partial Prefetching) + React `19.3.0` + TypeScript `5.x` (strict)
- **Styling:** Tailwind CSS `4.3.3` + semantic CSS tokens + `lucide-react` icons (zero emoji UI icons)
- **Database Layer:** Drizzle ORM + `pg` (`node-postgres`, compatible with Neon Pooler and standard PostgreSQL) + Drizzle Kit
- **Testing:** Vitest `5.1.2` + ESLint `9` (`eslint-config-next`)

---

## 3. Completed Work & Key Files

### Configuration & Environment
- [package.json](package.json) — Project metadata (`surgevanta`), dependencies, and scripts (`typecheck`, `lint`, `test`, `build`, `check`, `db:*`)
- [.env.example](.env.example) — Complete environment variable template with safe placeholders only (no secrets)
- [.gitignore](.gitignore) — Ignores `.env*` (keeping `!.env.example` tracked), local media uploads, and build artifacts
- [drizzle.config.ts](drizzle.config.ts) — Drizzle Kit PostgreSQL migration configuration using `DATABASE_URL_UNPOOLED`
- [vitest.config.mts](vitest.config.mts) — Vitest test runner configuration with `@/` alias and `server-only` test shim

### Domain, Database & Server Security
- [src/domain/platforms.ts](src/domain/platforms.ts) — Verified capability registry for all 9 target platforms (`facebook`, `instagram`, `tiktok`, `youtube`, `reddit`, `pinterest`, `linkedin`, `x`, `threads`), enforcing zero-spend defaults (`assisted_manual` for X and Reddit)
- [src/lib/env.ts](src/lib/env.ts) — Zod-validated environment parser and safe boolean readiness helper (never exposes secrets)
- [src/server/security/token-cipher.ts](src/server/security/token-cipher.ts) — Server-only AES-256-GCM OAuth token encryption/decryption with tamper detection and versioned payloads
- [src/server/db/schema.ts](src/server/db/schema.ts) — Normalized PostgreSQL schema (`users`, `social_accounts`, `media_assets`, `posts`, `post_targets` with unique `idempotency_key`, `post_media_attachments`)
- [src/server/db/index.ts](src/server/db/index.ts) — Lazy portable `pg.Pool` + Drizzle client (never connects when `DATABASE_URL` is unconfigured)
- [src/server/platforms/adapter.ts](src/server/platforms/adapter.ts) — `PlatformAdapter` contract supporting both `direct_published` and `assisted_ready` outcomes
- [src/app/api/health/route.ts](src/app/api/health/route.ts) — Dynamic runtime readiness endpoint (`GET /api/health`)

### Initial Design System & Workspace UI
- [src/app/globals.css](src/app/globals.css) & [src/app/layout.tsx](src/app/layout.tsx) — Coherent light/dark editorial SaaS token palette (`Plus Jakarta Sans` + `JetBrains Mono`)
- [src/components/ui/button.tsx](src/components/ui/button.tsx), [badge.tsx](src/components/ui/badge.tsx), [card.tsx](src/components/ui/card.tsx), [empty-state.tsx](src/components/ui/empty-state.tsx) — Reusable UI primitives
- [src/components/workspace/app-shell.tsx](src/components/workspace/app-shell.tsx), [readiness-strip.tsx](src/components/workspace/readiness-strip.tsx), [platform-matrix.tsx](src/components/workspace/platform-matrix.tsx) — Workspace navigation shell, live environment readiness strip, and interactive 9-platform capability matrix
- [src/app/page.tsx](src/app/page.tsx) — Milestone 1 Dashboard with honest empty states and `<Suspense>` streaming readiness strip

### Documentation & Tests
- [README.md](README.md) — Setup, architecture overview, and commands
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Full technical architecture, verified Neon free-tier constraints, security, scheduling, media storage, and risk analysis
- [docs/ROADMAP.md](docs/ROADMAP.md) — Realistic 7-milestone roadmap and Milestone 1 checklist
- [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) — Official API research for all 9 platforms
- [tests/token-cipher.test.ts](tests/token-cipher.test.ts), [tests/platforms.test.ts](tests/platforms.test.ts), [tests/env.test.ts](tests/env.test.ts) — 11 automated unit tests

---

## 4. Verification & Test Evidence

| Check | Command | Actual Outcome |
| --- | --- | --- |
| TypeScript Strict Check | `npm run typecheck` | **PASS** (exit 0) |
| ESLint | `npm run lint` | **PASS** (exit 0) |
| Unit Tests | `npm run test` | **PASS** (3 test files, 11/11 tests passed) |
| Production Build | `npm run build` | **PASS** (Next.js 16.4.6 Turbopack; `/` Partial Prerender, `/api/health` Dynamic) |
| Live HTTP Smoke Test | `next start -p 3099` + `GET /` & `GET /api/health` | **PASS** (both HTTP `200`, JSON readiness reports `databaseConfigured: false`, `platformsTracked: 9`) |

---

## 5. Known Issues, Blockers & Risks

1. **Neon PostgreSQL Credentials Pending:** Required before starting Milestone 2 (`DATABASE_URL` pooled + `DATABASE_URL_UNPOOLED` direct in local `.env.local`, never committed).
2. **API & Infrastructure Risks Documented:** X pay-per-use pricing (assisted workflow default), Reddit closed self-serve API registration (assisted workflow default), Meta/TikTok/Pinterest/YouTube review/audit gates, Cloudflare R2 credit-card activation requirement, and Vercel Hobby once-per-day cron limit (all mitigated in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).
3. **Moderate `npm audit` Notice in Dev Tooling:** `npm install` reported 4 moderate vulnerabilities in transitive dev tooling (`drizzle-kit` / `esbuild-kit` chain). Runtime production dependencies had `0` vulnerabilities. Will track during Milestone 2 dependency review.

---

## 6. Git Status

- **Repository Remote (`origin`):** `https://github.com/jeiso-n/surgeventa.git`
- **Branch:** `main` tracking `origin/main`
- **Foundation Commit Verified on Remote:** `a8287081d80693b559c1a4e9063fa4a3c3cc335e` (`feat(foundation): establish Surgevanta architecture, design system, and milestone 1 docs`)
- **Push Status:** **Pushed & verified on `origin/main`**

---

## 7. Next Actions

1. Product owner creates a free Neon PostgreSQL project (no credit card required) and supplies the pooled (`DATABASE_URL`) and direct (`DATABASE_URL_UNPOOLED`) connection strings for local `.env.local`.
2. Begin **Milestone 2 — Neon Database, Auth & Settings**: run initial Drizzle migrations on Neon, integrate Better Auth (email/password + database sessions), route protection, and user profile/timezone/publishing-defaults Settings module with automated tests.
