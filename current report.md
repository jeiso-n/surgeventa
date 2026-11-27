# Surgeventa — Current Project Report

**Official Product Name:** **Surgeventa** (`surgeventa`)  
**Last Updated:** 2026-11-27  
**Active Milestone:** Milestone 2 — Authentication & User Settings (**Completed & Verified**)  
**Brand Correction Status:** **Completed & Verified** (`0` tracked occurrences of old spelling; checkpoint commit `aeda0fd` pushed to `origin/main`)  
**Cross-Device Android Status:** **Architecture & API plan documented only** (Flutter Android implementation not started yet; scheduled for Milestone 8)  
**ChatGPT Independent Review Verdict:** Pending review

---

## 1. Objective & Current State

Surgeventa is a self-controlled, zero-spending unified social media publishing workspace built for portability across Neon PostgreSQL and standard Node/Next.js hosting, designed with a shared `/api/auth/*` + `/api/v1/*` backend for both the primary Next.js web workspace and a future Flutter Android application.

This cycle completed:
1. Global brand correction from the old spelling to **Surgeventa** (`surgeventa`), verified with a case-insensitive repository search (`0` matches) and pushed as its own checkpoint (`aeda0fd`).
2. Cross-device architecture documentation for the planned Flutter Android app in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).
3. Full **Milestone 2 — Authentication & User Settings** using Better Auth (`1.7.28`) with Drizzle ORM on Neon PostgreSQL, additive SQL migrations (`9/9` tables live), polished login/register/settings UI, server-enforced protected workspace & API routes, and complete Vitest + Playwright E2E verification.

---

## 2. Current Technical Stack

- **Repository Path:** `D:\Projects\surgeventa`
- **GitHub Remote:** `https://github.com/jeiso-n/surgeventa.git` (branch `main`)
- **Runtime:** Node.js `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.4`, Neon CLI `9.10.0`
- **Framework:** Next.js `16.4.6` (App Router, Cache Components, Partial Prefetching, `src/proxy.ts`) + React `19.3.0` + TypeScript `5.x` (strict)
- **Styling:** Tailwind CSS `4.3.3` + semantic light/dark design tokens (`Plus Jakarta Sans` + `JetBrains Mono`) + `lucide-react` icons
- **Database:** Neon Lakebase Postgres (`PostgreSQL 18.7`, Free Tier — `$0/month`) via Drizzle ORM `0.45.4` + `pg` (`node-postgres`, pooled runtime + direct unpooled migrations)
- **Authentication:** Better Auth `1.7.28` (`drizzleAdapter` for PostgreSQL, `emailAndPassword` with scrypt hashing, database-backed revocable sessions, `nextCookies` + `bearer` plugin for cross-device clients)
- **Testing:** Vitest `5.1.2` (unit + Neon integration) & Playwright (`@playwright/test` Chromium E2E)

---

## 3. Neon Database Status

- **Connection Status:** Connected & verified live (`PostgreSQL 18.7`, pooled `DATABASE_URL` at runtime, direct `DATABASE_URL_UNPOOLED` for migrations; `.env.local` strictly gitignored).
- **Migrations Applied (100% Additive — Zero Destructive Changes):**
  1. `drizzle/0000_illegal_texas_twister.sql` — 6 core tables (`users`, `social_accounts`, `media_assets`, `posts`, `post_targets`, `post_media_attachments`).
  2. `drizzle/0001_flowery_starbolt.sql` — Reviewed before applying; added 3 Better Auth tables (`auth_sessions`, `auth_accounts`, `auth_verifications`) and 3 additive columns on `users` (`email_verified`, `image`, `default_publishing_preferences`). All 6 existing tables and constraints preserved intact.
- **Total Verified Tables Live on Neon:** `9/9`.

---

## 4. Authentication & Settings Implementation Status

### Authentication (Complete)
- [src/server/auth/index.ts](src/server/auth/index.ts) — Better Auth configured on Drizzle + Neon PostgreSQL (`uuid` IDs, scrypt password hashing, 7-day DB sessions with immediate revocation via `cookieCache.enabled: false`, `HttpOnly` / `SameSite=Lax` cookies, `Secure` cookies on HTTPS deployments, `bearer()` plugin for future Android API auth).
- [src/server/auth/session.ts](src/server/auth/session.ts) — Server-side session verification (`getServerAuthContext`), Server Component guard (`requireServerSession` distinguishing `auth_required` vs `session_expired`), and REST API guard (`requireApiSession` returning HTTP `401`).
- [src/proxy.ts](src/proxy.ts) — Next.js 16 optimistic session-cookie redirect for `/` and `/settings`, backed by authoritative server DB verification on every protected page and API route.
- [src/app/api/auth/[...all]/route.ts](src/app/api/auth/[...all]/route.ts) — Better Auth catch-all handler.
- [src/app/login/page.tsx](src/app/login/page.tsx), [src/components/auth/login-form.tsx](src/components/auth/login-form.tsx), [src/app/register/page.tsx](src/app/register/page.tsx), [src/components/auth/register-form.tsx](src/components/auth/register-form.tsx), [src/components/workspace/sign-out-button.tsx](src/components/workspace/sign-out-button.tsx) — Cohesive Surgeventa auth UI with loading states, validation feedback, session-expired notices, and full navigation across auth transitions to flush React 19 `<Activity>` hidden DOM trees.

### User Settings & Cross-Device REST API (Complete)
- [src/domain/settings.ts](src/domain/settings.ts) — IANA timezone validation/formatting (`UTC` default fallback for scheduled posts), publishing preferences schema, and auth/settings Zod validators.
- [src/server/services/user-settings.ts](src/server/services/user-settings.ts) — Strictly `userId`-scoped profile, workspace summary, session listing/revocation, and current-password-verified email change services.
- Versioned JSON API endpoints (shared by web and future Flutter Android app):
  - `GET /api/v1/me` ([route.ts](src/app/api/v1/me/route.ts))
  - `GET / PATCH /api/v1/settings` ([route.ts](src/app/api/v1/settings/route.ts))
  - `POST /api/v1/settings/email` ([route.ts](src/app/api/v1/settings/email/route.ts))
  - `POST /api/v1/settings/password` ([route.ts](src/app/api/v1/settings/password/route.ts))
  - `GET / DELETE /api/v1/settings/sessions` ([route.ts](src/app/api/v1/settings/sessions/route.ts))
- [src/app/settings/page.tsx](src/app/settings/page.tsx) & [src/components/settings/settings-workspace.tsx](src/components/settings/settings-workspace.tsx) — Profile, timezone selector with live formatted preview, default publishing preferences, password-confirmed email change, password change, and active session revocation controls.

---

## 5. Tests & Verification Performed

| Check | Command | Actual Outcome |
| --- | --- | --- |
| Brand Check | Case-insensitive `git grep` for previous spelling | **PASS** — `0` matches across all tracked files |
| Additive SQL Migration | `npm run db:generate` + manual SQL review + `npm run db:migrate` | **PASS** — `drizzle/0001_flowery_starbolt.sql` applied cleanly (`9/9` tables live on Neon) |
| TypeScript Strict Check | `npm run typecheck` | **PASS** (exit 0) |
| ESLint | `npm run lint` | **PASS** (exit 0, 0 errors, 0 warnings) |
| Vitest Unit & Neon Integration | `npm run test` | **PASS** — 5 test files, **21/21 tests passed** (crypto, platforms, env, timezone/settings validation, Better Auth registration/login/invalid credentials/Bearer session validation/settings & timezone persistence/email change/cross-user isolation/session revocation) |
| Production Build | `npm run build` | **PASS** — Next.js `16.4.6` Turbopack compiled all 12 routes + `Proxy` cleanly |
| Playwright Chromium E2E | `npm run test:e2e` | **PASS** — **3/3 Chromium tests passed** against production `next start`: unauthenticated redirects & `401` API guards, User A register -> settings/timezone persistence across reload -> email change -> logout -> invalid & valid login, and User A vs User B browser/API isolation |

---

## 6. Outstanding Issues & Notes

1. **Email Verification Delivery (Zero-Spend):** Changing an email verifies the user's current password and updates the address cleanly, marking `emailVerified: false` transparently until a free email delivery transport is configured.
2. **`pg` SSL Mode Notice:** `pg` logs a non-blocking future-version warning suggesting `sslmode=verify-full` ahead of `pg` v9. Non-blocking; tracked for future connection-string standardization.
3. **Android Application:** Architecture and `/api/v1/*` + Bearer auth contract are documented and server-ready; Flutter Android client implementation is intentionally deferred until web publishing milestones mature (Milestone 8).

---

## 7. Git Status & GitHub Verification

- **Branch:** `main` tracking `origin/main` (`https://github.com/jeiso-n/surgeventa.git`)
- **Verified Prior Commits on `origin/main`:**
  - `a828708` — Milestone 1 foundation
  - `022b53d` — Milestone 1 report & remote push record
  - `a89cfb9` — Neon PostgreSQL health checks & initial Drizzle migrations
  - `aeda0fd` — Global brand correction to `Surgeventa` (`chore(brand): correct product branding to Surgeventa across repository`)
- **Milestone 2 Commit:** Committed and pushed immediately to `origin/main` (exact hash verified in handover response; `.env.local` strictly excluded via `.gitignore`).

---

## 8. Next Milestone

**Milestone 3 — Unified Content Composer, Media Library & Validation:**
- Pluggable `StorageProvider` (local zero-spend filesystem adapter with magic-byte MIME & size validation).
- Media Library management UI and `/api/v1/media` APIs.
- Unified post composer with multi-destination selection, per-platform caption overrides, live character & media constraint validation, platform previews, and draft persistence scoped to the authenticated user.
