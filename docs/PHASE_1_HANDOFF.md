# F90+ — Phase 1 Handoff (Identity & Accounts)

> **Session checkpoint — snapshot 2026-06-04. Resume from here.**
> Read order to resume: this file → [PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md) (spec) →
> [SCHEMA_V1.md](SCHEMA_V1.md) (DB) → [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md)
> (tasks) → [DECISIONS.md](DECISIONS.md) (D-034 + the why). Strategy B (premium, no shortcuts).

## Executive summary

Phase 1 (Identity & Accounts) is **~85% built**: the data + auth + onboarding + app gate + the public
profile are LIVE. The Supabase schema + economy + 48-country seed are **applied and verified**; **T4
(auth)**, **T5 (onboarding)**, **T6 (protected `(app)` group + `/home`)** and **T7 (public profile
`/u/[username]` + dynamic OG)** are **SHIPPED + verified**. The welcome bonus is **20,026 Tokens F90**
(D-039); the live-market ticker is now a **sticky bar** under the header (above the Hero). What remains
is **settings + 30-day cooldown (T8), rankings teaser (T9), i18n/token sweep (T10) and the DoD gate
(T11)**.

All work is on branch **`feat/phase-1-identity`** (**not pushed**, `main` untouched). Vision
**D-034** is baked into a **generic economy** so markets/players/fantasy plug in later without
reshaping Identity; T4's auth/identity surface is provider-agnostic and carries no
subsystem-specific coupling (D-035).

## Repository state

- **Branch:** `feat/phase-1-identity` (off `main` = `b6bff60`, Phase 0.6)
- **Last code commit:** `972a240` — `feat(profile): T7 — public profile /u/[username] + dynamic OG card` (this docs commit lands on top). Since T6: sticky ticker (`cb3c2b3`), Founding Squad doc (D-040, `66139b2`), T7 (`972a240`).
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
- **T5 onboarding BUILT + verified:** `features/profile/{validation,actions,countries,onboarding-form}.ts(x)`
  + `app/[locale]/onboarding/page.tsx` (session-gated). `parseUsername` (format `^[a-z0-9_]{3,20}$`
  + reserved list, 9 unit tests) · `checkUsername` (live availability) · `updateProfile` (RLS
  self-update, sets the `*_changed_at` cooldown stamps; maps unique/FK violations). Country picker
  reads the 48 `countries` with correct flags (`flagAssetFor(name_en)`, NOT the 3-letter code).
  Signup routes new users here (`next=/onboarding`). **Verified E2E** (see Auth state).
- **NOT BUILT:** public profile `/u/[username]` = T7; settings (full edit) + 30-day cooldown UI = T8.

## Wallets / Ledgers state

- **DONE + verified:** `wallets`, `coin_ledger`, `score_ledger` + `award_coins`/`award_points`
  (`SECURITY DEFINER`, EXECUTE revoked from clients, granted to `service_role`).
  Server-authoritative; `check (coins_balance >= 0)`. **Latent** until spending (Phase 3).
- **Welcome bonus = 20,026 Tokens F90** (migration **0003**, D-039 — supersedes the 1,000 of D-031).
  Currency single-source: `lib/economy.ts` (`WELCOME_BONUS_TOKENS`, `CURRENCY_NAME`). **Verified E2E**:
  a fresh signup credited `coins_balance=20026` + a `signup_bonus` ledger row of `20026`. The earlier
  T4/T5 notes saying "1000/`fan_e1632271`=1000" are historical (bonus was 1,000 then).
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
- **`auth` (T4) + `onboarding` (T5) namespaces ADDED** in `locales/{es,en}.json` with full key
  parity, no hardcoded copy. (`markets` was also added by the landing pass — D-036.)
- **NOT ADDED yet:** namespaces `profile` (T7), `rankings` (T9).

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

## T5 — Onboarding ✅ DONE (verified E2E 2026-06-04)

`features/profile/` (validation [9 unit tests], actions, countries, onboarding-form) +
`app/[locale]/onboarding/page.tsx` (session-gated; signup defaults `next=/onboarding`).
- **Gates:** `pnpm typecheck` ✅ · `pnpm test` ✅ 72 · `pnpm build` ✅.
- **Verified E2E through the real UI + a real session** (minted via admin `generate_link` →
  completed through our own `/callback` token-hash path, which also re-proved T4's `verifyOtp`
  branch): the 48-country picker renders with correct flags, the username field live-checks
  availability ("Disponible"), and submit wrote `username=cuco_t5_test` + `country_code=ESP` (Spain)
  + both `*_changed_at` stamps via RLS self-update, then redirected home. Test users cleaned up.

## T6 — Protected app group ✅ DONE (verified E2E 2026-06-04)

`features/auth/guards.ts` (`requireOnboardedUser`), `app/[locale]/(app)/layout.tsx` (the gate) +
`app/[locale]/(app)/home/page.tsx` (the first authed surface: greeting + **Tokens F90 balance** +
points + backed nation). `isProfileComplete` is pure + unit-tested (`country_code` +
`username_changed_at` both set). Onboarding success now lands on `/home`; onboarding stays OUTSIDE the
group (no redirect loop).
- **Gates:** `pnpm typecheck` ✅ · `pnpm test` ✅ 78 · `pnpm build` ✅.
- **Verified E2E:** (1) signed-out `/home` → `/login?next=/home`; (2) signed-in but not onboarded →
  forced to `/onboarding`; (3) after onboarding → `/home` renders "Hola, @t6_user" · **20.026 Tokens
  F90** · "Vas con Argentina". Test users cleaned up.

## T7 — Public profile ✅ DONE (verified 2026-06-04)

`app/[locale]/u/[username]/` (public `page.tsx` + `opengraph-image.tsx`), `components/ui/avatar.tsx`,
`lib/avatar.ts` (own-IP gradient+initial, pure, 6 tests), `profile` i18n namespace. Reads `profiles`
by handle (citext); `notFound()` for unknown handles. Per-user OG via `next/og` ImageResponse.
- **Gates:** `pnpm typecheck` ✅ · `pnpm test` ✅ 84 · `pnpm build` ✅.
- **Verified:** `/u/proftest` renders (name · @handle · "Va con España" · join date · points · rank
  teaser · avatar); unknown handle → 404; the OG route returns a valid 64 KB `image/png`.

## Next step (exact) — T8: Settings (edit profile) + 30-day cooldown

`app/[locale]/(app)/settings/page.tsx` (gated by the `(app)` group, T6): edit `display_name`, `bio`
(≤280, the DB check), and the avatar token; **username/country changes honour the 30-day cooldown**
(D-031) computed from `username_changed_at` / `country_changed_at` (a pure, testable helper —
`canChangeAfterCooldown(stampedAt, now)`). `updateProfile`-style Server Action writing via the RLS
self-update policy; reuse `features/profile/validation.ts`. New `settings` i18n namespace. **Done when:**
edits persist, the cooldown is enforced with a localized "you can change this again on <date>" message,
and the form is ES/EN.

## PHASE 1 STATUS

| Task | Status |
| --- | --- |
| Pre-flight (P1–P4) | ✅ completado |
| T1 — Supabase SSR + composed middleware | ✅ completado |
| T2 — Migration 0001 (schema/RLS/functions/view) | ✅ completado (applied + verified) |
| T3 — Seed countries (48) | ✅ completado (applied + verified) |
| T4 — Auth flows (magic-link + Google, routes, i18n) | ✅ completado (verificado funcionalmente) |
| T5 — Onboarding (username + country) | ✅ completado (verificado E2E + DB) |
| T6 — Protected routes + auth-aware header | ✅ completado (verificado E2E) |
| T7 — Public profile `/u/[username]` + OG | ✅ completado (verificado: render · 404 · OG png) |
| T8 — Settings + 30-day cooldown | ⏳ pendiente (NEXT) |
| T9 — Rankings teaser (replace mock) | ⏳ pendiente |
| T10 — i18n parity + tokens sweep | ⏳ pendiente |
| T11 — Phase DoD gate | ⏳ pendiente |
