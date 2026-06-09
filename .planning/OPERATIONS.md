# F90+ — OPERATIONS.md

> **Operational runbook for cold-start execution.** Exact commands, deploy procedure,
> migrations, admin endpoints, env inventory, freshness re-verification, and troubleshooting —
> so a future GSD session can *operate* F90+ from `.planning/` alone. Deeper detail lives in
> `docs/DEPLOY_RUNBOOK.md` + `AGENTS.md` (in-repo, not external). **Snapshot:** 2026-06-09.
>
> **Hard rules every session inherits:** never deploy / PR / push without explicit founder go
> (deploy = manual `vercel --prod`, D-033; autonomous merge→deploy only when the D-055 quality
> bar is met) · never store / print / commit secrets · conversation **Spanish**, code/docs **English**.

---

## 1. Prerequisites & local quirks

- **Node ≥ 20.9** (Node 24 recommended; `.nvmrc` = 24). **pnpm via Corepack** (`pnpm@9.15.0`).
- **pnpm is not on PATH on this machine.** Use Corepack with an explicit filter/dir:
  - From repo root: `corepack pnpm -w run <script>` (root scripts proxy to `apps/web`).
  - Direct on the app: `corepack pnpm -C apps/web run <script>`.
- **Local dev preview port: 3300** (not the default 3000) — historically used for founder verification.
- Repo root: `C:\Users\Usuario\Documents\F90PLUS\f90plus`. App: `apps/web`. `packages/` reserved.

## 2. Run / build / quality gates

| Goal | Command (from repo root) |
|------|--------------------------|
| Install | `corepack pnpm install` |
| Dev server | `corepack pnpm -C apps/web run dev` (→ http://localhost:3000; `/` = ES, `/en` = EN; founder port 3300 if configured) |
| **Typecheck** (gate 1) | `corepack pnpm -C apps/web run typecheck` (`tsc --noEmit`) |
| **Lint** (gate 2) | `corepack pnpm -C apps/web run lint` (`eslint .`) |
| **Tests** (gate 3) | `corepack pnpm -C apps/web run test` (`vitest run`; ~243 cases) · watch: `... run test:watch` |
| **Build** (gate 4) | `corepack pnpm -C apps/web run build` (`next build`; must be green with **no** `ignore*Errors`) |
| Format | `corepack pnpm -w run format` / `format:check` |

> **Definition of Done = all 4 gates green + browser-verified ES+EN+mobile (0 console errors) +
> no hardcoded copy/design values + docs/DECISIONS updated.** There is **no CI** yet (ROADMAP H3),
> so these are run manually until then. `tsc` run *outside* the pnpm/workspace context can show
> false "module not found" errors — always run via the scripts above.

## 3. Where things live (path map)

```
apps/web/src/
├── app/[locale]/            # routes; (auth)/ + (app)/ groups; api/admin/{sync-fixtures,settle}
├── components/ ui|layout|atmosphere
├── features/  home|copilot|tournament|globe|predictions|markets|auth|profile
├── lib/       supabase/{server,public,admin,middleware} · football · copilot · scoring.ts · economy.ts · rankings.ts
├── i18n/      routing.ts · request.ts · navigation.ts
├── locales/   es.json · en.json          # ALL user-facing copy
└── styles/globals.css                     # @theme design tokens
apps/web/supabase/migrations/  0001..0006  # SQL = source of truth (raw-applied, no CLI history)
docs/                                       # vision/design/ADR (docs/DECISIONS.md = D-001..D-059)
.planning/                                  # THIS GSD system (single source of truth)
```

## 4. Database & migrations

- Migrations are **raw SQL** under `apps/web/supabase/migrations/` (`0001`–`0006`), the **source of truth**.
  **No Supabase CLI history** — applied via the **Supabase SQL Editor** (or Management API + PAT).
- **Applied in prod (`f90-production`, ref `upelxcxnpmmbhivrazle`, eu-west-1):** `0001`–`0006`.
  Each migration has verify queries in `apps/web/supabase/README.md`.
- **Verify a function exists (10s, SQL editor):** `select to_regprocedure('public.settle_fixture(text)');` → non-null = applied.
- **Planned next migration:** `0007` (ROADMAP H1) — ledger unique index + `fixtures` prob CHECK + bonus-source dedup. *Do not author/apply until H1.*
- **Economy is server-authoritative:** clients are SELECT-only on money tables; writes only via
  `SECURITY DEFINER` funcs `make_prediction` / `settle_fixture` / `award_points` / `award_coins`.

## 5. Admin endpoints (manual today → automate in H1)

Both are POST, secret-guarded (`x-admin-secret: <ADMIN_SYNC_SECRET>`), timing-safe, fail-closed
(503 if the secret env is unset), service-role only, idempotent.

| Endpoint | When | Effect |
|----------|------|--------|
| `POST /api/admin/sync-fixtures` | **pre-matchday** | openfootball schedule → upsert `fixtures` (+ model probs). Expect ~72 group-stage fixtures. Never clobbers settled state. |
| `POST /api/admin/settle` | **post-match / post-matchday** | ingests final scores → finalizes fixtures → `settle_fixture` awards points + Tokens → ranking populates. Idempotent (safe to re-run). |

Example: `curl -X POST https://www.f90.xyz/api/admin/sync-fixtures -H "x-admin-secret: $ADMIN_SYNC_SECRET"`.
A response **401 (not 503)** without the secret proves the secret IS set in that environment.

## 6. Deploy procedure (D-033 — manual, shared Chiribito Vercel team)

**Production is published MANUALLY** (the `f90` project is NOT git-connected). From the repo root,
on the commit you want live:
```
vercel link --project f90 --yes --scope chiribito293-7173s-projects
vercel --prod --yes
```
Builds the local working tree, aliases **`www.f90.xyz`**. Root Directory = `apps/web`. **Vercel
Instant Rollback** is available per deploy. **Open governance item (ROADMAP H4 / DEC-5):** git-connect
`f90` (auto preview-per-PR + gated prod) and/or migrate it off the shared Chiribito team.
**Verify a deploy:** `https://www.f90.xyz/` (ES) + `/en` (EN) → 200; gated routes (`/home`,
`/predictions`, `/ranking`) → 307 → `/login`; `/u/[unknown]` → 404.

## 7. Environment variables (NAMES only — never print/commit values)

| Var | Where | Purpose |
|-----|-------|---------|
| `NEXT_PUBLIC_APP_URL` | public | canonical URL / OG / sitemap / robots (prod = `https://www.f90.xyz`) |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL (runtime) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public | anon/publishable key (runtime) |
| `SUPABASE_SECRET_KEY` | **server-only** | service-role; admin jobs only (`lib/supabase/admin.ts`); NEVER `NEXT_PUBLIC_` |
| `ADMIN_SYNC_SECRET` | **server-only** | guards `/api/admin/*` (timing-safe) |
| `COPILOT_SOURCE` / `FOOTBALL_DATA_API_KEY` | optional | env-gated football-data enrichment (dormant in V1) |
| `API_FOOTBALL_KEY` | reserved | not read yet (Phase 3 / H7) |
| `SUPABASE_ACCESS_TOKEN` | **local CLI only** | Supabase CLI/MCP token in `.env.local`; **never** add to Vercel; document as CLI-only (H4) |

Runtime needs **only the public vars**. Vercel prod currently has all 4 active vars set
(`NEXT_PUBLIC_*` ×2 + `SUPABASE_SECRET_KEY` + `ADMIN_SYNC_SECRET`). `.env.local` is gitignored.

## 8. Snapshot freshness & re-verification (run before trusting STATE)

This `.planning/` snapshot is dated **2026-06-09**. Over weeks/months, git/prod/data move. **Before
acting, re-confirm the load-bearing facts with these read-only checks** and update `STATE.md` if they changed:

```
git -C <repo> rev-parse --abbrev-ref HEAD          # expect: main
git -C <repo> status --short                        # expect: clean (+ .planning/ if uncommitted)
git -C <repo> log --oneline -8                       # confirm HEAD vs STATE's recorded commit
ls apps/web/supabase/migrations                      # confirm migration set vs STATE
# prod sanity (no secret): expect 401 not 503 → admin secret set in prod
curl -s -o /dev/null -w "%{http_code}" -X POST https://www.f90.xyz/api/admin/settle
```
If a finished match exists (opener **2026-06-11** onward) but the ranking is empty, **settlement has
not been run** → `POST /api/admin/settle` (§5) is the pending operator action.

## 9. Troubleshooting / known gotchas

- **WebGL globe screenshots flake headless** → verify the globe via DOM/computed-style or a real browser, not headless capture.
- **`tsc` direct false errors** → run typecheck via the pnpm script (workspace resolution).
- **pnpm not on PATH** → always `corepack pnpm -C apps/web ...`.
- **ISR** → `/[locale]` revalidates on a 6h fetch window (real fixtures); a stale-looking landing may just be cached.
- **Magic-link at scale** → built-in Supabase email is rate-limited; Resend SMTP is the production path (DEC-6); Google OAuth already works.
