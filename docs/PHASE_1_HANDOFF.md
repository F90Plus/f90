# F90+ — Phase 1 Handoff (Identity & Accounts)

> **Session checkpoint — snapshot 2026-06-04. Resume from here.**
> Read order to resume: this file → [PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) (spec) →
> [SCHEMA_V1.md](SCHEMA_V1.md) (DB) → [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md)
> (tasks) → [DECISIONS.md](DECISIONS.md) (D-034 + the why). Strategy B (premium, no shortcuts).

## Executive summary

Phase 1 (Identity & Accounts) is **~55% built and the data + auth flows are LIVE**. The
Supabase schema + economy + 48-country seed are **applied and verified end-to-end**, and **T4
(auth flows) is now SHIPPED + functionally verified**: magic-link + Google sign-in, a dual-mode
callback, login/signup screens (ES+EN), and an auth-aware header. What remains is **onboarding
(T5), the auth-gated app group (T6), public profile (T7), settings (T8), rankings teaser (T9),
i18n/token sweep (T10) and the DoD gate (T11)**.

All work is on branch **`feat/phase-1-identity`** (**not pushed**, `main` untouched). Vision
**D-034** is baked into a **generic economy** so markets/players/fantasy plug in later without
reshaping Identity; T4's auth/identity surface is provider-agnostic and carries no
subsystem-specific coupling (D-035).

## Repository state

- **Branch:** `feat/phase-1-identity` (off `main` = `b6bff60`, Phase 0.6)
- **Last code commit:** `b902e8e` — `feat(auth): T4 — magic-link + Google sign-in, dual-mode callback, auth-aware header` (this docs commit lands on top)
- **Working tree:** clean.
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
  - `b902e8e` feat(auth): T4 — magic-link + Google, dual-mode callback, auth-aware header

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
  both 200; 0 console/server errors). `getCurrentUser()` helper consumed by the header.
- **`handle_new_user` trigger VERIFIED THROUGH THE REAL FLOW:** a magic-link request from the UI
  created `fan_e1632271` with profile + wallet (1000) + `signup_bonus` ledger row (then cleaned up).
- **T4 BUILT + verified:** `features/auth/{validation,actions,auth-panel,magic-link-form,google-button}.ts(x)`,
  routes `app/[locale]/(auth)/{login,signup}/page.tsx` + `(auth)/callback/route.ts`, `(auth)/layout.tsx`,
  and the auth-aware header (`components/layout/{header,user-menu}.tsx`). Server Actions
  `signInWithMagicLink` / `signInWithGoogle` / `signOut`; the callback handles `code` **and**
  `token_hash`; redirect resolution is pure + unit-tested (12 tests). See D-035.

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

- **Configured + WIRED (T4):** Google Cloud (project F90+, consent screen External, test user added,
  Web OAuth client with redirect `https://upelxcxnpmmbhivrazle.supabase.co/auth/v1/callback`) +
  Supabase Google provider (client id/secret). **Initiation verified**: the button issues a 303 to the
  provider authorize URL. Full consent completion needs a real Google login (founder).

## Magic Link state

- **Email provider ON + WIRED (T4).** Verified: a valid email returns the "check your inbox" success
  state (Supabase accepted `signInWithOtp`). Clicking the link to finish needs a real inbox (founder).
  Dev uses Supabase's built-in SMTP (rate-limited); production needs its own SMTP (Resend) — **open debt**.
- **Redirect allow-list:** added `http://localhost:3300/**` this session (dev). Still has
  `https://www.f90.xyz/**` but **not** apex `https://f90.xyz/**`, and `site_url` is still
  `http://localhost:3000` — founder/dashboard items before production auth (D-035).

## i18n state

- **ES (default) + EN in place** (foundation + Phase 0.6), full parity, no hardcoded copy.
- **`auth` namespace ADDED (T4)** in `locales/{es,en}.json` with full key parity, no hardcoded copy.
- **NOT ADDED yet:** namespaces `onboarding` (T5), `profile` (T7), `rankings` (T9).

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

## T4 — Auth flows ✅ DONE (verified 2026-06-04)

Shipped + functionally verified on localhost:3300 (server on the allow-listed port):
- `features/auth/`: `validation.ts` (pure, 12 unit tests — email/zod, open-redirect guard,
  locale-prefix), `actions.ts` (`signInWithMagicLink` / `signInWithGoogle` / `signOut`),
  `auth-panel.tsx`, `magic-link-form.tsx`, `google-button.tsx`.
- Routes: `app/[locale]/(auth)/{login,signup}/page.tsx` + `(auth)/layout.tsx`;
  `(auth)/callback/route.ts` completes **both** `code` (exchangeCodeForSession) and `token_hash`
  (verifyOtp), preserving locale + a sanitised `next`.
- i18n `auth` namespace (ES/EN parity); auth-aware header + `user-menu.tsx`.
- **Gates:** `pnpm typecheck` ✅ · `pnpm test` ✅ 63 · `pnpm build` ✅ (no `ignore*Errors`).
- **Verified:** ES+EN render (0 console errors), invalid email → localized error, valid email →
  "check your inbox", Google → 303 to authorize URL, signed-out header shows "Sign in" (mobile too).

## Next step (exact) — T5: Onboarding (username + favourite country)

Build `features/profile/`: pick `username` (live uniqueness check against `profiles.username`,
citext-unique) + favourite country (the 48 from `countries`); `updateProfile` Server Action writing
through the RLS self-update policy; new i18n namespace `onboarding`. After auth, route a brand-new
user here (set `next=/onboarding` once the route exists; the auth redirect already preserves it).
**Reuse** the existing `lib/supabase` clients + `features/auth/validation.ts` patterns. **Done when:**
a new user sets a valid unique username + country; invalid/taken usernames are rejected with
localized errors.

## PHASE 1 STATUS

| Task | Status |
| --- | --- |
| Pre-flight (P1–P4) | ✅ completado |
| T1 — Supabase SSR + composed middleware | ✅ completado |
| T2 — Migration 0001 (schema/RLS/functions/view) | ✅ completado (applied + verified) |
| T3 — Seed countries (48) | ✅ completado (applied + verified) |
| T4 — Auth flows (magic-link + Google, routes, i18n) | ✅ completado (verificado funcionalmente) |
| T5 — Onboarding (username + country) | ⏳ pendiente (NEXT) |
| T6 — Protected routes + auth-aware header | ⏳ pendiente |
| T7 — Public profile `/u/[username]` + OG | ⏳ pendiente |
| T8 — Settings + 30-day cooldown | ⏳ pendiente |
| T9 — Rankings teaser (replace mock) | ⏳ pendiente |
| T10 — i18n parity + tokens sweep | ⏳ pendiente |
| T11 — Phase DoD gate | ⏳ pendiente |
