# Surgeventa — Milestone Roadmap

Surgeventa is built in small, independently verifiable milestones. Every milestone must pass automated checks and be backed up to GitHub before starting the next.

| Milestone | Scope | Status |
| --- | --- | --- |
| **M1 — Project Discovery & Foundation** | Next.js 16 + TypeScript + Tailwind v4 foundation, Drizzle PostgreSQL schema & portable client, AES-256-GCM token cipher, 9-platform verified capability registry, initial design system & dashboard shell, `.env.example`, full documentation, Vitest suite, Git initialization & GitHub push. | **Completed & Verified** |
| **M2 — Neon Database, Auth & Settings** | Connect Neon PostgreSQL via user credentials, run initial & Better Auth additive Drizzle migrations, integrate Better Auth (email/password, scrypt hashing, revocable DB sessions, secure cookies + bearer API support for cross-device compatibility), login/register pages, server-enforced protected workspace, user profile, email change, timezone & publishing defaults settings, active session management, Vitest + Playwright E2E suite. | **Completed & Verified** |
| **M3 — Unified Composer, Media Library & Validation** | Pluggable `StorageProvider` (local dev storage first), secure media upload/metadata inspection, unified post composer, per-platform caption overrides, live character/media validation engine, real platform previews, draft persistence via shared `/api/v1/*` APIs. | Pending |
| **M4 — Social Accounts & First Verified Direct Integrations** | OAuth state/PKCE framework, encrypted token lifecycle (refresh + expiry/revocation handling), Social Accounts management UI, first direct free-tier adapters (**LinkedIn** & **YouTube**, followed by **Threads/Meta**), plus **Assisted Publishing** handoff flows for **X** and **Reddit**. | Pending |
| **M5 — Scheduling Engine, Calendar & Idempotent Publishing** | Atomic PostgreSQL-backed job claiming (`idempotency_key`), secured scheduler tick endpoint + zero-spend trigger setup, immediate & scheduled publishing respecting each user's configured timezone, per-destination status tracking, safe manual retries, interactive Calendar view with platform/account filters. | Pending |
| **M6 — Additional Platform Adapters (Meta, Pinterest, TikTok)** | Facebook Pages, Instagram Business/Creator, Pinterest API v5 (Trial + Standard-ready), and TikTok Content Posting API (with required creator disclosure UX and audit readiness). | Pending |
| **M7 — Publishing History, Official Analytics & Hardening** | Historical post audit log, destination-specific publishing outcome details, official analytics ingestion where supported (strictly distinguishing unavailable metrics from `0`), security audit, rate-limit hardening, and deployment readiness. | Pending |
| **M8 — Android Companion App (Flutter)** | Installable Android application built in Flutter (Android Studio) consuming the same `/api/auth/*` (Bearer token) and `/api/v1/*` backend endpoints—sharing accounts, drafts, calendar, media metadata, and publishing history with zero duplicated backend logic or direct database access. | Planned (Architecture Documented) |

## Milestone 1 Acceptance Criteria Checklist

- [x] Working Next.js + TypeScript + Tailwind CSS development environment.
- [x] Documented architecture (`docs/ARCHITECTURE.md`) with verified Neon free-tier research.
- [x] Documented milestone roadmap (`docs/ROADMAP.md`).
- [x] Documented platform API research (`docs/INTEGRATIONS.md`) covering all 9 target platforms.
- [x] Consistent initial design system (`src/components/ui/*`) and workspace shell (`src/app/page.tsx`).
- [x] Complete `.env.example` with safe placeholders only (zero secrets).
- [x] Automated unit tests (Vitest), TypeScript strict check, ESLint, and Next.js production build.
- [x] Canonical `current report.md` reflecting verified repository state.
- [x] Connected GitHub remote (`https://github.com/jeiso-n/surgeventa.git`) and verified push on `main`.
