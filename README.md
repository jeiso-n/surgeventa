# Surgevanta

Surgevanta is a self-controlled, production-minded unified social media publishing workspace inspired by Buffer's workflow, engineered under a strict **zero-spending constraint** and full database/hosting portability.

## Product Goals

- Connect supported social accounts securely via official OAuth APIs.
- Compose content once, adapt per-platform variations, validate constraints, and preview before publishing.
- Publish immediately or schedule ahead with per-destination status tracking and idempotent duplicate protection.
- Provide honest **Assisted Publishing** handoffs for platforms that do not offer free automated publishing (such as X and Reddit).
- Maintain strict separation between UI, business logic, database access, authentication, platform adapters, and background scheduling.

## Technology Stack

- **Framework:** Next.js `16.4.6` (App Router) + React `19.3.0` + TypeScript (strict)
- **Styling:** Tailwind CSS `4.3.3` + semantic design tokens + `lucide-react` vector icons
- **Database & ORM:** Neon PostgreSQL (Free Tier) + Drizzle ORM + `pg` (`node-postgres`, portable across any PostgreSQL host)
- **Validation & Security:** Zod + AES-256-GCM server-side OAuth token encryption (`src/server/security/token-cipher.ts`) + `server-only` guards
- **Testing & Quality:** Vitest, ESLint, TypeScript (`tsc --noEmit`)

## Project Structure

```text
src/
├── app/                   # Next.js App Router pages, layout, global design tokens, Route Handlers
├── components/
│   ├── ui/                # Reusable design system primitives (Button, Badge, Card, EmptyState)
│   └── workspace/         # Workspace layout shell, readiness indicators, platform capability matrix
├── domain/                # Pure domain definitions (9 target platforms and zero-spend constraints)
├── lib/                   # Shared utilities and Zod-validated environment readiness parser
└── server/
    ├── db/                # Portable PostgreSQL pool and Drizzle schema
    ├── platforms/         # PlatformAdapter contract for direct API and assisted workflows
    └── security/          # AES-256-GCM token encryption at rest
docs/
├── ARCHITECTURE.md        # Technical architecture, Neon setup, security, scheduling, and risks
├── ROADMAP.md             # Milestone breakdown and acceptance criteria
└── INTEGRATIONS.md        # Verified API research for all 9 target platforms
tests/                     # Automated Vitest unit tests
```

## Getting Started (Local Development)

### Prerequisites

- Node.js `>= 20.9.0` (verified with `v26.13.0`)
- npm `>= 10` (verified with `11.20.0`)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(The app boots cleanly in Milestone 1 without database credentials and honestly reports pending setup status.)*
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` (and check `/api/health` for runtime readiness JSON).

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build production bundle |
| `npm run start` | Run production server |
| `npm run typecheck` | Run TypeScript strict type checking (`tsc --noEmit`) |
| `npm run lint` | Run ESLint across the repository |
| `npm run test` | Run Vitest automated test suite |
| `npm run check` | Run `typecheck`, `lint`, and `test` sequentially |
| `npm run db:generate` | Generate Drizzle SQL migrations from `src/server/db/schema.ts` |
| `npm run db:migrate` | Apply migrations using `DATABASE_URL_UNPOOLED` |
| `npm run db:studio` | Open Drizzle Studio for local database inspection |

## Key Documentation

- [Technical Architecture](docs/ARCHITECTURE.md)
- [Milestone Roadmap](docs/ROADMAP.md)
- [Platform Integrations Research](docs/INTEGRATIONS.md)
- [Current Project Report](current%20report.md)
