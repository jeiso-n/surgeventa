# Surgeventa

Surgeventa is a self-controlled, production-minded unified social media publishing workspace inspired by Buffer's workflow, engineered under a strict **zero-spending constraint**, **cross-device API readiness** (web workspace + planned Flutter Android app), and full database/hosting portability.

## Product Goals

- Connect supported social accounts securely via official OAuth APIs.
- Compose content once, adapt per-platform variations, validate constraints, and preview before publishing.
- Publish immediately or schedule ahead in each user's configured timezone, with per-destination status tracking and idempotent duplicate protection.
- Provide honest **Assisted Publishing** handoffs for platforms that do not offer free automated publishing (such as X and Reddit).
- Share one authoritative backend and PostgreSQL database across the Next.js web workspace and the planned Flutter Android application (documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md); Android implementation scheduled for a later milestone).

## Technology Stack

- **Framework:** Next.js `16.4.6` (App Router, Cache Components, Proxy) + React `19.3.0` + TypeScript (strict)
- **Styling:** Tailwind CSS `4.3.3` + semantic design tokens + `lucide-react` vector icons
- **Database & ORM:** Neon Lakebase Postgres (`PostgreSQL 18.7`, Free Tier) + Drizzle ORM + `pg` (`node-postgres`, portable across any PostgreSQL host)
- **Authentication:** Better Auth `1.7.28` (email/password, scrypt hashing, revocable database-backed sessions, secure cookies via `nextCookies`, plus `bearer` plugin for future Flutter Android API auth)
- **Validation & Security:** Zod + AES-256-GCM server-side OAuth token encryption (`src/server/security/token-cipher.ts`) + `server-only` guards
- **Testing & Quality:** Vitest `5.1.2` (unit + Neon integration), Playwright (Chromium E2E), ESLint `9`, TypeScript (`tsc --noEmit`)

## Project Structure

```text
src/
├── app/                   # Next.js App Router pages (/, /login, /register, /settings) & API Route Handlers
│   └── api/
│       ├── auth/[...all]/ # Better Auth endpoints (cookies + bearer)
│       ├── health/        # Safe runtime & Neon database readiness probe
│       └── v1/            # Decoupled JSON REST endpoints shared by web & planned Flutter Android client
├── components/
│   ├── auth/              # Login & registration forms and auth shell
│   ├── settings/          # Profile, timezone, publishing defaults, email, password & active sessions UI
│   ├── ui/                # Reusable design system primitives (Button, Badge, Card, Input, Label, Alert, EmptyState)
│   └── workspace/         # Protected workspace navigation shell, readiness strip, platform capability matrix
├── domain/                # Pure domain definitions (9 platforms, timezone & settings schemas)
├── lib/                   # Shared utilities, auth client, and Zod environment readiness parser
├── proxy.ts               # Next.js 16 optimistic session-cookie guard (paired with server DB verification)
└── server/
    ├── auth/              # Better Auth server configuration and server/API session enforcement
    ├── db/                # Portable PostgreSQL pool and Drizzle schema (9 tables)
    ├── platforms/         # PlatformAdapter contract for direct API and assisted workflows
    ├── security/          # AES-256-GCM token encryption at rest
    └── services/          # Strictly user-scoped settings, session, and workspace services
docs/
├── ARCHITECTURE.md        # Technical architecture, cross-device Flutter plan, Neon setup, security & risks
├── ROADMAP.md             # Milestone breakdown and progress
└── INTEGRATIONS.md        # Verified API research for all 9 target platforms
tests/                     # Vitest unit & Neon integration tests
e2e/                       # Playwright Chromium end-to-end tests
drizzle/                   # Versioned additive PostgreSQL SQL migrations
```

## Getting Started (Local Development)

### Prerequisites

- Node.js `>= 20.9.0` (verified with `v26.13.0`)
- npm `>= 10` (verified with `11.20.0`)
- Neon PostgreSQL free-tier project (or any standard PostgreSQL instance)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and configure `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`, `TOKEN_ENCRYPTION_KEY`, and `CRON_SECRET`. *(Never commit `.env.local`.)*
3. Apply Drizzle PostgreSQL migrations:
   ```bash
   npm run db:migrate
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` (unauthenticated visitors are redirected to `/login`; register at `/register`).

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build production bundle |
| `npm run start` | Run production server |
| `npm run typecheck` | Run TypeScript strict type checking (`tsc --noEmit`) |
| `npm run lint` | Run ESLint across the repository |
| `npm run test` | Run Vitest unit & Neon integration test suite |
| `npm run test:e2e` | Run Playwright Chromium end-to-end test suite |
| `npm run check` | Run `typecheck`, `lint`, and `test` sequentially |
| `npm run db:generate` | Generate additive Drizzle SQL migrations from `src/server/db/schema.ts` |
| `npm run db:migrate` | Apply migrations using `DATABASE_URL_UNPOOLED` |
| `npm run db:studio` | Open Drizzle Studio for local database inspection |

## Key Documentation

- [Technical Architecture & Cross-Device Plan](docs/ARCHITECTURE.md)
- [Milestone Roadmap](docs/ROADMAP.md)
- [Platform Integrations Research](docs/INTEGRATIONS.md)
- [Current Project Report](current%20report.md)
