# Surgevanta — Current Project Report

**Last Updated:** 2026-11-26  
**Active Milestone:** Milestone 1 — Project Discovery & Foundation  
**Status:** Foundation built & verified locally; **GitHub push blocked pending remote repository URL**  
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

1. **GitHub Remote Blocker (Blocks Milestone 1 Push):**
   - `d:\Projects\surgeventa` started as an empty directory with no `.git` repository and no configured GitHub remote.
   - `gh` CLI is not installed, and read-only checks against `https://github.com/jeisbyte/surgeventa.git` and `https://github.com/jeisbyte/surgevanta.git` both returned `Repository not found`.
   - **Action needed:** Product owner must create the GitHub repository (or share the exact HTTPS/SSH URL of an existing repository) so `origin` can be added and the local `main` commit pushed and verified.
2. **Neon PostgreSQL Credentials Pending:** Required before Milestone 2 (`DATABASE_URL` pooled + `DATABASE_URL_UNPOOLED` direct).
3. **API & Infrastructure Risks Documented:** X pay-per-use pricing (assisted workflow default), Reddit closed self-serve API registration (assisted workflow default), Meta/TikTok/Pinterest/YouTube review/audit gates, Cloudflare R2 credit-card activation requirement, and Vercel Hobby once-per-day cron limit (all mitigated in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).
4. **Moderate `npm audit` Notice in Dev Tooling:** `npm install` reported 4 moderate vulnerabilities in transitive dev tooling (`drizzle-kit` / `esbuild-kit` chain). Runtime production dependencies had `0` vulnerabilities. Will track during Milestone 2 dependency review.

---

## 6. Git Status

- **Branch:** `main` (initialized locally)
- **Remote `origin`:** Not configured yet (blocked pending repository URL from product owner)
- **Push Status:** **Not pushed to GitHub yet** (local checkpoint commit only; will push immediately once remote URL is provided)

---

## 7. Next Actions

1. Receive GitHub repository URL from product owner, configure `origin`, push `main`, verify remote commit visibility, and update Section 6 of this report with the verified push details.
2. Begin **Milestone 2 — Neon Database, Auth & Settings** once Neon PostgreSQL connection strings (`DATABASE_URL` and `DATABASE_URL_UNPOOLED`) and preferred deployment/media storage choice are confirmed.
