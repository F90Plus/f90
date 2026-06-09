# F90+ — PROJECT.md

> **GSD project context.** Source of truth for *what F90+ is and why*. Read order for a
> cold start: **`STATE.md` (START HERE)** → `PROJECT.md` (this) → `REQUIREMENTS.md` →
> `ROADMAP.md` → `OPERATIONS.md` (runbook, reference). This `.planning/` folder is the
> **single source of truth** and self-sufficient — a new session resumes from it without any
> prior chat or external memory. Deeper rationale lives in-repo at `docs/` (notably
> `docs/DECISIONS.md`, the ADR log D-001→D-059) and `AGENTS.md` — read those only for depth,
> never as a prerequisite to start.
>
> **Authored:** 2026-06-09 by the GSD Planning Architect pass (read-only audit). Product
> copy is **English**; team collaboration is **Spanish**.

---

## What F90+ is

A **social, free-to-play prediction experience for the 2026 World Cup**. Users make calls
on real matches, earn **virtual** currency ("Tokens F90") and skill **points**, climb a
**global ranking**, and are guided by a deterministic football **Copilot** ("The Analyst").
Live in production at **https://www.f90.xyz** (GitHub `F90Plus/f90` → Vercel → `www.f90.xyz`).

> 🛑 **Not gambling.** Virtual coins only. No deposits, no payouts, no real money — ever.
> Probabilities are signal, never a wager.

## Vision — the "living World Cup" experience model (D-024)

F90+ is **not** a fantasy app, a betting app, a prediction market, or a tracker — it
**fuses all of it into one living experience** where the user builds an evolving story
during the tournament. Four shared layers sit under every pillar:

- **World** — the 3D globe + the planet's live pulse.
- **Identity** — public profile / reputation / favourite country.
- **Economy** — virtual coins (Tokens F90) + points + reputation.
- **Time** — everything live with the real tournament.

Pillars (predictions · fantasy XI · player portfolio & discovery · markets · rankings/
reputation · narrative · country hubs · live tracking) all **feed and draw from** those
layers. New features must plug into this spine or they don't belong. Full blueprint:
`docs/EXPERIENCE_SYSTEM.md` · `docs/PROJECT_VISION.md` · `docs/ECOSYSTEM_VISION.md`.

## Objectives

1. **Be live and credible for the World Cup window** (opener **2026-06-11**) — the
   predict→settle→earn loop must run reliably, observably, and honestly during the
   tournament. *(This is the current operating priority — see ROADMAP P0.)*
2. **Grow the daily habit** — make a call before kickoff; correct calls earn points + Tokens.
3. **Turn earned Tokens into a game** — player market + Fantasy XI (the next product milestone).
4. **Compound socially** — rankings, private leagues, reputation, shareable cards.
5. **Stay premium and honest** — broadcast-grade craft, deterministic intelligence, zero
   fabricated data, zero dark patterns, no betting.

## Stack

Next.js 16 (App Router, RSC) · React 19 · TypeScript **strict** (`noUncheckedIndexedAccess`) ·
Tailwind v4 (CSS-first `@theme` tokens) · Framer Motion · next-intl (es default + en) ·
Supabase (`@supabase/ssr`, Postgres + RLS) · pnpm workspaces (`apps/web`, `packages/` reserved) ·
Geist + Space Grotesk · CVA + tailwind-merge. Data: **openfootball** (zero-key, cache-first) +
model probabilities from Elo; **football-data.org** adapter built but env-gated.

## Architecture posture (see `docs/ARCHITECTURE.md`)

- **Server-first**, `'use client'` only at interactive leaves.
- **Feature-scoped** (`features/<feature>/`); shared primitives in `components/`.
- **Swappable adapters** (cache-first, degrade gracefully, never throw to the user).
- **Server-authoritative economy:** clients are SELECT-only on money tables; the sole write
  paths are `SECURITY DEFINER` Postgres functions (`make_prediction`, `settle_fixture`,
  `award_points`, `award_coins`). The deterministic prediction engine is pure (no LLM).
- **Tokens over hardcoding** (design values in `globals.css`); **i18n always** (copy in `locales/`).

## Economy model (D-027 / D-034 / D-039)

Three currencies: **points** (skill, permanent, feed rankings, never spent), **coins =
"Tokens F90"** (spendable; welcome bonus **20,026**), **reputation** (derived, Phase 4+).
A correct prediction credits **both** points and Tokens. Append-only ledgers
(`score_ledger`, `coin_ledger`) with cached projections (`profiles.total_points`,
`wallets.coins_balance`), mutated only by definer functions. The economy is **generic**
(`kind, ref_type, ref_id`) so markets/players/fantasy plug in with **no Identity reshape**.

## Standing invariants (never violated without explicit founder sign-off)

1. **Total isolation** from other ecosystems (PMS / PT / Chiribito / XPrediction) — no shared
   repos, infra, branding, code or accounts. *(Open exception under remediation: the Vercel
   **team** is currently shared with Chiribito — D-033, ROADMAP H4.)*
2. **Dual-surface parity** (D-021) — mobile + desktop conceived AND validated together; mobile
   is never a shrunk desktop.
3. **Premium football atmosphere** — night stadium / broadcast, never casino.
4. **World Cup 2026 identity** front and center.
5. **Social-first.**
6. **Free** — no real money, no betting, no pay-to-win. Virtual only.
7. **Clean, scalable, very visual, very alive.**
8. **English product, Spanish collaboration** — no hardcoded user-facing copy (i18n always).
9. **No paid LLM / no paid data in V1** — intelligence is deterministic, from real data.
10. **Tokens over hardcoding** (color/spacing/motion live in the design system).
11. **Tool-agnostic & portable** — standard tech only; any AI/human can continue F90+ (D-016).

**Craft bar (D-020):** built like a premium studio producing the *official digital experience
of a World Cup* — maximum craft by default, fewer-but-excellent, **premium-or-don't-ship**.

**Prediction-market identity LOCKED (D-037):** always express **probability (%)**, never
bookmaker **odds**. Vocabulary law: *predict · position · conviction · chance · probability ·
allocate F90 · participants* — **never** bet / wager / stake / odds / cuota / apuesta. This
governs every price surface (ticker, future markets, player markets).

## How decisions get made (operating model — `docs/OPERATING_MODEL.md`)

- **Default and proceed** for reversible, conventional choices; record in `docs/DECISIONS.md`.
- **Flag before building** anything that looks wrong/risky/incoherent.
- **Escalate only the founder's:** product vision, priorities, spend, brand-identity shifts,
  new public commitments. **Production deploy is NOT an escalation** when the quality bar is
  met (D-055): implementation → gates → PR → review → merge → deploy prod → verify → checkpoint.
- **Definition of Done:** `pnpm typecheck` clean · `pnpm lint` clean · `pnpm build` green (no
  `ignore*Errors`) · verified in browser ES + EN + mobile, 0 console errors · no hardcoded
  copy/design values · coherent with the design system · docs + DECISIONS updated.

## Constraints / non-goals

- No real-money betting, payouts, or any gambling mechanic.
- No pay-to-win; monetization never buys predictive edge.
- No arcade FUT/Panini/EA clones — player representation is **own F90+ IP** (D-025); names +
  real stats are facts and fine; official crests/kits/photos avoided.
- No heavyweight microservice/Turborepo tax before the product needs it.
- No AI/editor lock-in — portable tooling only.

## Isolation

Code/repo isolated (`F90Plus/f90`, own GitHub org). Supabase `f90-production` isolated +
ACTIVE_HEALTHY. **Vercel team currently shared with Chiribito** (D-033) — the one open
isolation item, addressed in ROADMAP **H4**. Deploying F90+ never touches Chiribito.

## Glossary (for a fully cold start)

| Term | Meaning |
|------|---------|
| **The loop** | predict → lock-at-kickoff → settle → points + Tokens → ranking. The core daily habit. |
| **Tokens F90** | the spendable virtual currency (DB column `coins_balance`). Welcome bonus **20,026**. Not real money. |
| **Points** | skill currency — permanent, feeds rankings/reputation, **never spent**. |
| **Reputation** | derived cross-pillar currency (Phase 4+). |
| **The Analyst ("El Analista")** | the deterministic (no-LLM) prediction engine; pre-community it **IS** the market — "you vs the Analyst's lean". |
| **openfootball** | zero-key, public-domain WC2026 data (fixtures/groups/bracket); cache-first, mock fallback. |
| **Settlement** | server-side scoring + award after a match finishes (`settle_fixture`, idempotent). |
| **`(app)` group** | the auth-gated route group (`/home`, `/predictions`, `/ranking`, `/settings`). |
| **Dual-surface parity** | mobile + desktop designed AND validated together (D-021). |
| **Craft bar** | premium-or-don't-ship standard of work (D-020). |
| **Probability-not-odds** | house language law (D-037): always % "chance", never bookmaker odds / bet / stake. |
| **Server-authoritative** | clients are SELECT-only on money tables; writes only via `SECURITY DEFINER` Postgres functions. |

## Binding decisions (active, load-bearing — digest of `docs/DECISIONS.md`)

> A curated index of the decisions that constrain *every* future phase. Full context: `docs/DECISIONS.md`
> (D-001→D-059). Status: all ✅ active unless noted.

| ID | Essence (binding) |
|----|-------------------|
| **D-005** | Copilot V1 has **no LLM** — deterministic engine; an LLM may later narrate, never be the source of truth. |
| **D-016** | **Tool-agnostic & portable** — standard tech only; any AI/human can continue F90+. No lock-in. |
| **D-020** | **Craft bar** — built like a premium studio; premium-or-don't-ship; fewer-but-excellent. |
| **D-021** | **Dual-surface parity** — mobile is never a shrunk desktop; validate both at real scale. |
| **D-025** | Player representation = **own F90+ IP** (no FIFA/Panini/EA assets); names + real stats are facts. |
| **D-027** | **Three currencies** — points (rank, never spent) · coins/Tokens (spend) · reputation. Append-only ledgers. |
| **D-033** | **Vercel reality (OPEN):** `f90` deploys **manually** (`vercel --prod`) on a team **shared with Chiribito**, not git-connected. → ROADMAP H4 / DEC-5. |
| **D-034** | **Generic economy** — `(kind, ref_type, ref_id)` absorbs markets/players/fantasy with no Identity reshape. |
| **D-037** | **Probability-NOT-odds LOCKED** + the no-betting vocabulary law. Governs every price surface. |
| **D-039** | Currency = **"Tokens F90"**; welcome bonus **20,026** (migration 0003). |
| **D-042** | Two surfaces (public discovery vs private portfolio dashboard) — **future, documented-not-built**; do not reopen as polish. |
| **D-049** | The `updateSession` cookie deviation is **FIXED** (`c4dee71`) — do not re-introduce it as a bug. |
| **D-050** | Predictions are **server-authoritative** via `make_prediction` (SECURITY DEFINER); clients SELECT-only. |
| **D-055** | **Autonomous merge→deploy** allowed when the quality bar is met (supersedes D-033's manual gate for the deploy step) — F90+ only. |
| **D-058/059** | Phase 2 canonical closeout — the loop is **LIVE + verified**; settlement installed; Phase-3 awaits the free-staking decision. |

## Current position

See **`STATE.md`** for the exact post-audit snapshot. In one line: Phases 0–2 are **done, deployed,
and the predict→settle→earn loop is LIVE in production**; the active GSD milestone is **Hardening →
Economy**, and the next phase to execute is **H1 (Tournament Operations Safety Net)**.
