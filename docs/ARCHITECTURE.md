# Surgevanta — Technical Architecture

## 1. Architectural Principles

1. **Zero-Spending First:** Every infrastructure choice, database tier, and default social platform workflow must operate at `$0/month` without requiring paid subscriptions or surprise usage overages.
2. **Database & Hosting Portability:** No proprietary database SDK lock-in in business logic. Standard PostgreSQL SQL/ORM access, pluggable media storage, and HTTP-triggered scheduling allow moving between local Docker, Vercel Hobby, or a self-hosted VPS without rewriting core modules.
3. **Strict Separation of Concerns:**
   - `src/app/` — Thin routing, layouts, Server Components, and API Route Handlers.
   - `src/components/` — Reusable UI design system primitives and workspace views.
   - `src/domain/` — Pure, framework-independent domain rules and platform capability definitions.
   - `src/server/db/` — Database schema, migrations, and connection pooling.
   - `src/server/security/` — Server-only cryptography, auth helpers, and secret validation.
   - `src/server/platforms/` — Pluggable `PlatformAdapter` implementations per social network.
   - `src/server/publishing/` *(Milestone 5)* — Idempotent publishing engine and scheduler tick processor.
4. **Honest Capabilities:** Never fake successful publishing, never fabricate analytics, and never present paywalled/restricted APIs as automated free integrations.

---

## 2. Stack Selection & Rationale

| Layer | Selection | Rationale |
| --- | --- | --- |
| Full-Stack Framework | **Next.js 16 (App Router) + React 19 + TypeScript (strict)** | Unified frontend + secure server-side Route Handlers/Server Actions, strict client/server boundary via `server-only`, strong ecosystem, free deployment or local Node hosting. |
| Styling & UI | **Tailwind CSS v4 + Semantic CSS Tokens + Lucide Icons** | Coherent design system without heavyweight component library lock-in; crisp vector icons (zero emoji UI). |
| Database | **Neon PostgreSQL (Free Plan)** | `$0/month`, no credit card required, hard caps (no surprise bills), standard PostgreSQL compatibility. |
| ORM & Migrations | **Drizzle ORM + `pg` (`node-postgres`) + Drizzle Kit** | Lightweight, type-safe SQL migrations, zero codegen overhead, works identically on Neon's PgBouncer pooler and local Docker/standard PostgreSQL. |
| Validation | **Zod** | Single-source schema validation for environment variables, API inputs, and composer payloads. |
| Auth *(Milestone 2)* | **Better Auth (database sessions via Drizzle)** | Native Drizzle + PostgreSQL adapter, TypeScript-first, supports database-backed revocable sessions, extensible to 2FA and multi-workspace roles. |
| Testing | **Vitest (unit/integration) + Playwright (E2E in M2+)** | Fast native TypeScript unit tests + deterministic browser verification for UI flows. |

---

## 3. Neon PostgreSQL Setup & Free-Tier Design

### Verified Neon Free Plan Limits (as of 2026)
- **Cost:** `$0/month`, no credit card required; hard caps suspend compute or reject writes rather than billing overages.
- **Storage:** `1 GB` per project (`20 GB` account-wide cap).
- **Compute:** `100 CU-hours/month` per project (~400 active hours at 0.25 CU; autoscales up to 2 CU).
- **Scale-to-Zero:** Compute suspends automatically after `5 minutes` of inactivity (cannot be disabled on Free tier).
- **Branches:** Up to `10` branches per project (ideal for `main` production + `dev` testing branches).
- **Egress:** `5 GB/month` public network transfer.
- **Restore History:** Up to `6 hours` (1 GB change history cap).

### Recommended Database Architecture
1. **Two Connection Strings:**
   - `DATABASE_URL` — Neon **pooled** (`-pooler`) URL with `?sslmode=require`, used by `pg.Pool` (`max: 5`) at runtime to prevent connection exhaustion.
   - `DATABASE_URL_UNPOOLED` — Neon **direct** URL without `-pooler`, used strictly by `drizzle-kit` migrations (`npm run db:migrate`).
2. **Scale-to-Zero Resilience:**
   - Lazy pool initialization in `src/server/db/index.ts` ensures the app boots cleanly without opening unnecessary connections.
   - Cold-start wakeups on Neon Free Tier take ~500ms–2s; server queries and scheduler retries will use short connection timeouts (`10s`) and safe exponential backoff.
3. **Never Store Binary Media in Neon:**
   - With a 1 GB storage cap, images and videos must **never** be stored as `bytea` blobs in PostgreSQL. PostgreSQL stores metadata only (`media_assets` table).
4. **Database-Level Reliability:**
   - Normalized core tables defined in `src/server/db/schema.ts`: `users`, `social_accounts`, `media_assets`, `posts`, `post_targets`, `post_media_attachments`.
   - `post_targets.idempotency_key` has a `UNIQUE` database constraint so retries or concurrent scheduler runs cannot publish the same target twice.

---

## 4. Security Architecture

- **Zero Client Secret Exposure:** All secrets (`DATABASE_URL`, `AUTH_SECRET`, `TOKEN_ENCRYPTION_KEY`, `CRON_SECRET`, OAuth client secrets) stay strictly on the server, guarded by `import "server-only"`.
- **OAuth Token Encryption at Rest:** Access and refresh tokens are encrypted before database writes using **AES-256-GCM** (`src/server/security/token-cipher.ts`) with random 96-bit IVs, 128-bit auth tags, and versioned payloads (`v1:<iv>:<tag>:<ciphertext>`) for future key rotation.
- **OAuth State & PKCE *(Milestone 4)*:** Every OAuth initiation generates a cryptographically random `state` nonce (and PKCE `code_verifier` where supported) stored in an `HttpOnly`, `SameSite=Lax`, short-lived cookie/DB record and verified on callback to block CSRF/session fixation.
- **Safe Logging:** Error handlers and health endpoints expose boolean readiness flags and safe error codes only — never raw tokens, headers, or connection strings.

---

## 5. Background Job & Scheduling Architecture (Zero-Spend)

Vercel's free Hobby tier restricts built-in cron jobs to **once per day** (±59 min precision). To support reliable 5-to-15 minute scheduled publishing at `$0/month` without vendor lock-in:

1. **PostgreSQL as the Durable Queue:** `posts` and `post_targets` hold `scheduled_for`, `status`, `attempt_count`, and `idempotency_key`.
2. **Atomic Claiming:** A scheduled tick worker claims due targets atomically inside a transaction (`FOR UPDATE SKIP LOCKED` / conditional status transition `pending -> publishing`) before calling any external social API.
3. **Portable Trigger Endpoint:** `POST /api/internal/scheduler/tick` authenticated via `Authorization: Bearer <CRON_SECRET>`.
4. **Zero-Cost Trigger Options:**
   - Local development / self-hosted: lightweight Node cron loop or Docker scheduler container.
   - Cloud free tier: GitHub Actions scheduled workflow (every 5–15 min) or free external webhook cron (e.g., `cron-job.org`) calling the secured tick endpoint.

---

## 6. Media Storage Strategy (Zero-Spend & Credit-Card-Free)

- **Important Constraint Found During Research:** Cloudflare R2 has a 10 GB free tier, **but requires a credit card on file** to activate due to usage-based overage billing.
- **Portable Adapter Design (`StorageProvider` in Milestone 3):**
  - **Local / Self-Hosted Mode (`local`):** Stores validated uploads in `./storage/local` (gitignored) with MIME magic-byte verification and strict size limits.
  - **Public URL Requirement for Meta APIs:** Instagram and Threads Graph APIs require publicly reachable HTTPS URLs when creating media containers. Before enabling live Instagram/Threads publishing in cloud deployments, we will support either a **card-free hard-capped object store** (such as Upstash Blob or Supabase Storage free tier) or a user-approved S3-compatible provider.

---

## 7. Major Technical & API-Access Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| **X (Twitter) discontinued free API tier** (pay-per-use credits: `$0.015`/post, `$0.20`/post with URL) | High | Default X to an honest **Assisted Publishing** workflow (`$0`), with full character/media validation and one-click composer handoff. |
| **Reddit closed public self-serve API registration** | High | Default Reddit to **Assisted Publishing** unless the owner supplies an already-approved official non-commercial OAuth client. |
| **Platform App Reviews & Audits** (Meta App Review, TikTok audit, Pinterest Standard access, YouTube OAuth verification) | High | Build owner-usable dev/sandbox flows first; document exact verification requirements in `docs/INTEGRATIONS.md`; never claim public multi-user approval before passing review. |
| **Personal Account Restrictions** (Facebook Pages only; Instagram Business/Creator only) | Medium | Enforce account-type checks during OAuth discovery and surface clear user explanations before connecting. |
| **Neon Free Tier Compute/Storage Caps** (1 GB storage, 100 CU-hours/mo, 5-min scale-to-zero) | Medium | Never store binaries in Postgres, avoid polling loops that keep Neon awake 24/7 (only wake Neon when due posts exist or user interacts), keep connection pool small. |
| **Vercel Hobby Daily Cron Limit** | Medium | Decouple scheduler execution behind a secured HTTP tick endpoint triggerable by free GitHub Actions or local worker. |
| **Token Expiration & Revocation** (e.g., 60-day Threads/Meta tokens, short-lived OAuth access tokens) | Medium | Store `token_expires_at`, implement proactive server-side refresh, and mark accounts `expired`/`revoked` clearly on 401/403 responses without silent retries. |
