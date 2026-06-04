# F90+ — Phase 1 Handoff (Identity & Accounts)

> **Session checkpoint — snapshot 2026-06-04. Resume from here.**
> Read order to resume: this file → [PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) (spec) →
> [SCHEMA_V1.md](SCHEMA_V1.md) (DB) → [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md)
> (tasks) → [DECISIONS.md](DECISIONS.md) (D-034 + the why). Strategy B (premium, no shortcuts).

## Executive summary

Phase 1 (Identity & Accounts) is **~40% built and the data foundation is LIVE**. The
Supabase schema + economy + 48-country seed are **applied and verified end-to-end** on the
isolated `f90-production` project; the auth **infrastructure** (SSR clients + composed
middleware) is in place and verified. What remains is the **user-facing flow**: auth screens,
onboarding, public profile, settings, rankings teaser, i18n parity, DoD gate.

All work is on branch **`feat/phase-1-identity`** (8 commits, **not pushed**, `main`
untouched). Vision **D-034** is baked into a **generic economy** so markets/players/fantasy
plug in later without reshaping Identity.

## Repository state

- **Branch:** `feat/phase-1-identity` (off `main` = `b6bff60`, Phase 0.6)
- **Last commit:** `fa83bde` — `fix(db): grant Data API privileges for Phase 1 tables (RLS-gated)`
- **Working tree:** clean (plus this handoff commit)
- **Not pushed; `main` untouched.**
- **Commits this session (oldest → newest):**
  - `4f68053` refactor(football): unify the openfootball source URL in util
  - `0c0c9a9` test(copilot): guard model, engine and openfootball parsing
  - `769fd05` chore(env): document real env var names in .env.example
  - `031ea5c` docs(decisions): record the expanded product vision (D-034)
  - `30ae5df` feat(auth): Supabase SSR clients + composed session middleware (T1)
  - `faa978b` feat(db): Phase 1 identity & economy schema (0001) (T2)
  - `901e796` feat(db): seed 48 WC2026 countries + coherence test (0002) (T3)
  - `fa83bde` fix(db): grant Data API privileges (RLS-gated)

## Supabase state

- **Project:** `f90-production` (ref `upelxcxnpmmbhivrazle`), `eu-west-1`, `ACTIVE_HEALTHY`.
- **Isolated:** only 1 project in the account.
- **New API key system** (publishable / secret).
- **`apps/web/.env.local`** (gitignored, NOT in repo) holds: `NEXT_PUBLIC_APP_URL`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`,
  `SUPABASE_ACCESS_TOKEN` (PAT). **All verified working.**
- **Migrations applied via the Management API** (`POST /v1/projects/{ref}/database/query`)
  with the PAT — **not** via CLI migration history. The SQL files are the source of truth.

## Migrations applied

- `20260604000001_identity.sql` — **APPLIED ✅** (schema, RLS, functions, view, grants)
- `20260604000002_countries_seed.sql` — **APPLIED ✅** (48 nations)

Verified live: 5 tables (all RLS on), 3 functions, `global_rankings` view, 48 countries / 3 hosts.

## Seeds applied

- **`countries`: 48 nations**, hosts USA/MEX/CAN, derived from `teams.ts` + Spanish names.
  Guarded by `countries-seed.test.ts` (fails if it drifts from `teams.ts`).

## Auth state

- **Infrastructure DONE + verified (T1):** `lib/supabase/{client,server,middleware}.ts` and
  `proxy.ts` composing next-intl + `updateSession`. Locale routing intact (`/`=ES, `/en`=EN,
  both 200; 0 console/server errors). `getCurrentUser()` helper ready for header/protected routes.
- **`handle_new_user` trigger VERIFIED:** a real signup creates profile + wallet (1000) +
  `signup_bonus` ledger row.
- **NOT BUILT:** auth UI/flows (Server Actions `signIn`/`signUp`/`signOut`, `(auth)/` routes) = **T4**.

## Identity state

- **`profiles` table + trigger DONE + verified.** Schema carries no subsystem-specific fields (D-034).
- **NOT BUILT:** onboarding (username + country) = T5; public profile `/u/[username]` = T7;
  settings + 30-day cooldown = T8.

## Wallets / Ledgers state

- **DONE + verified:** `wallets`, `coin_ledger`, `score_ledger` + `award_coins`/`award_points`
  (`SECURITY DEFINER`, EXECUTE revoked from clients, granted to `service_role`).
  Server-authoritative; `check (coins_balance >= 0)`. **Latent** until spending (Phase 3).
- `ledger_kind` already includes `market_trade`/`player_purchase`/`player_sale`/`fantasy_reward` (D-034 forward).

## Rankings state

- **`global_rankings` view DONE + verified** (`security_invoker`, public grant).
- **NOT BUILT:** rankings teaser UI replacing `data/leaderboard.ts` mock = T9.

## OAuth Google state

- **Configured:** Google Cloud (project F90+, consent screen External, test user added, Web OAuth
  client with redirect `https://upelxcxnpmmbhivrazle.supabase.co/auth/v1/callback`) + Supabase
  Google provider (client id/secret). **READY to wire in T4. Not E2E-tested yet.**

## Magic Link state

- **Email provider ON** in Supabase. **READY to wire in T4.** Dev uses Supabase's built-in SMTP
  (rate-limited); production needs its own SMTP (Resend) — **open debt**.

## i18n state

- **ES (default) + EN in place** (foundation + Phase 0.6), full parity, no hardcoded copy.
- **NOT ADDED yet:** namespaces `auth` (T4), `onboarding` (T5), `profile` (T7), `rankings` (T9).

## Documentation state

- `docs/DECISIONS.md` — D-034 recorded.
- `apps/web/supabase/README.md` — migrations, security hardening, how-applied, verify steps.
- `docs/PHASE_1_IDENTITY.md` / `SCHEMA_V1.md` / `PHASE_1_IMPLEMENTATION_PLAN.md` — contracts (valid).
- `docs/PROJECT_STATE.md` — updated to point here.
- **THIS FILE** — the live Phase 1 handoff.

## Architectural decisions

- **D-034** — expanded vision (Polymarket-style markets, persistent virtual wallet, player
  buy/sell + dynamic pricing, full squad XI + bench + team value, social rankings + private
  leagues, player/asset portfolio). Identity stays generic; the economy absorbs all of it via
  `coin_ledger.kind` / `(ref_type, ref_id)` + `award_*` — **same wallet + points, no reshape**.
- **Security hardening over the SCHEMA_V1 base** (documented in `0001` + `supabase/README`):
  `award_*` EXECUTE revoked from anon/authenticated (service_role + trigger only);
  `global_rankings` `security_invoker`; RLS uses `(select auth.uid())`; explicit Data API grants
  (countries/profiles/rankings public; wallets/ledgers authenticated-only; anon blocked on money).
- **New Supabase key system** (publishable/secret); migrations applied via the Management API + PAT.
- **D-028 honoured:** forward tables (`fixtures`/`predictions`/`players`/`squads`/`lineups`/`leagues`)
  are designed in SCHEMA_V1, **not built** in Phase 1.

## Open risks

- **Magic-link in production** needs its own SMTP (Resend); dev SMTP is rate-limited.
- **Google OAuth + magic-link not yet E2E-tested** (done in T4; magic-link E2E needs a real inbox —
  the founder may need to click an email, or use admin-API test users).
- **Migrations applied as raw SQL** (Management API), no CLI migration-history tracking. If switching
  to `supabase db push` later, reconcile the history.
- **ESLint still broken** at the tooling level (FlatCompat circular structure) — pre-existing;
  typecheck + tests + build are the effective gates. Fix still pending (separate task).
- **PAT in `.env.local`** grants whole-account Supabase access (account is F90+-only; revocable). Never commit it.
- `next-env.d.ts` oscillates between build/dev variants — cosmetic; reset it if it shows as a change.
- **Carryover:** Vercel manual deploy + Vercel team shared with Chiribito (D-033); WC opener 11 Jun
  vs the playable loop (Strategy B accepted: quality over the group-stage capture window).

## Next step (exact) — T4: Auth flows

Build:
- `features/auth/actions.ts` (Server Actions): `signInWithMagicLink(email)`,
  `signInWithGoogle()` (OAuth), `signOut()`. Zod-validated server-side.
- Routes `app/[locale]/(auth)/{login,signup,callback}` — the `callback` exchanges the OAuth
  code for a session and **preserves the locale**.
- i18n namespace **`auth`** in `locales/{es,en}.json` (parity).
- A **basic auth-aware header** (avatar/menu when signed in; "Sign in" when not) using
  `getCurrentUser()`.

**Verify:** pages render in ES + EN (preview); a real signup provisions profile + wallet (already
proven at the DB level); Google + magic-link reach the callback. **Reuse the existing
`lib/supabase` clients — do NOT rebuild the SSR/middleware (done in T1).**

## PHASE 1 STATUS

| Task | Status |
| --- | --- |
| Pre-flight (P1–P4) | ✅ completado |
| T1 — Supabase SSR + composed middleware | ✅ completado |
| T2 — Migration 0001 (schema/RLS/functions/view) | ✅ completado (applied + verified) |
| T3 — Seed countries (48) | ✅ completado (applied + verified) |
| T4 — Auth flows (magic-link + Google, routes, i18n) | ⏳ pendiente (NEXT) |
| T5 — Onboarding (username + country) | ⏳ pendiente |
| T6 — Protected routes + auth-aware header | ⏳ pendiente |
| T7 — Public profile `/u/[username]` + OG | ⏳ pendiente |
| T8 — Settings + 30-day cooldown | ⏳ pendiente |
| T9 — Rankings teaser (replace mock) | ⏳ pendiente |
| T10 — i18n parity + tokens sweep | ⏳ pendiente |
| T11 — Phase DoD gate | ⏳ pendiente |
