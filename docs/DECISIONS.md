# F90+ — Decision Log (ADR)

Lightweight architecture/product decision records, newest context preserved. Each
entry: **context → decision → consequences**. This is the long-term coherence
backbone — when in doubt about *why* something is the way it is, it's here.

Status legend: ✅ active · 🔄 superseded · 🕒 proposed

---

### D-001 — Stack ✅
**Context:** Greenfield, premium, scalable, mobile-first.
**Decision:** Next.js 16 (App Router, RSC) · React 19 · TypeScript strict · Tailwind
v4 (CSS-first tokens) · Framer Motion · next-intl · Geist + Space Grotesk.
**Consequences:** Modern, server-first, token-driven; bleeding-edge but coherent.

### D-002 — Monorepo (`apps/web`) ✅
**Context:** Founder asked for `apps/`-style structure + future growth.
**Decision:** pnpm workspace; the app lives in `apps/web`, `packages/` reserved.
**Consequences:** Room for more apps/shared packages without restructuring.

### D-003 — i18n: next-intl, ES default + EN ✅
**Context:** Global World Cup audience; founder is Spanish.
**Decision:** next-intl, locales `es` (default) + `en`, `localePrefix: as-needed`
(`/` = ES, `/en` = EN). Catalogs in `apps/web/locales/`. No hardcoded copy.
**Consequences:** Adding a language = 1 routing entry + 1 catalog file.

### D-004 — Visual language: night stadium / broadcast ✅
**Context:** Premium, football, alive; explicitly *not* casino.
**Decision:** Dark night surfaces, **LED blue** as primary UI color, volt cyan +
gold + lime accents, soft glows, broadcast eyebrows, one ease-out motion curve.
**Consequences:** Distinct from a green-felt casino look; coheres with the logo.

### D-005 — Copilot V1 has no LLM ✅
**Context:** Founder wants no paid LLM; predictions must be honest/explainable.
**Decision:** A deterministic **signal + scoring engine**; insights via i18n
templates. Intelligence = combining real data well, not generating text.
**Consequences:** $0, deterministic, explainable, no hallucinations. LLM can be
added later as a narration/chat layer on top — never the source of truth.

### D-006 — Free data stack ✅
**Context:** $0 for V1, World-Cup-ready, stable, easy to integrate.
**Decision:** football-data.org (free, WC + leagues) + API-Football (free 100/day,
all endpoints) + The Odds API (free 500/mo, market consensus) + openfootball
(public-domain bracket) + TheSportsDB (media) + **F90+ first-party community
consensus**. No free tipster-consensus API exists → use de-vig odds + community.
**Consequences:** Complete, free, upgradeable to paid tiers later. See
[DATA_SOURCES_RESEARCH.md](DATA_SOURCES_RESEARCH.md).

### D-007 — Cache-first ingestion ✅
**Context:** Free tiers are rate-limited (100/day).
**Decision:** Scheduled jobs pull into our own store; app/copilot read only from us.
Never call third parties per user request.
**Consequences:** Fast, resilient, scales with users without touching quotas.

### D-008 — Branding as code (SVG + on-build generation) 🔄 superseded by D-012
**Context:** The founder's definitive logo (3D gold WC trophy + chrome "F90+" +
lime "+") can't be materialized into a repo file from chat; founder wants the studio
to own the whole pipeline.
**Decision:** Build the functional brand system in **vector/code** — an SVG
trophy-in-circle mark, a chrome wordmark, and `next/og`-generated OG/app-icons.
Reserve a slot for the founder's 3D render as the **marketing-hero** raster.
**Consequences:** Resolution-independent, themeable, zero-asset-dependency, instantly
consistent. The 3D render can drop in later for marketing without code changes.

### D-009 — Brand green aligned to the logo's lime ✅
**Context:** Founder: keep the *same lime green* as the logo's "+".
**Decision:** Add a `lime` token (~#AEF23A) and use it as the brand-green accent
(logo "+", brand glow, "free"/success). Keep `pitch` for data-viz/field semantics.
**Consequences:** "Same lime green" becomes a system rule, not an intention.

### D-010 — Copilot V1 runs on mock/cached data; adapters env-gated ✅
**Context:** "Implement V1" but "no paid APIs / no keys / very intelligent & alive."
**Decision:** The engine is real and deterministic, fed by **mock snapshots** now.
The football-data adapter is implemented but **gated by env** (defaults to mock); the
API-Football adapter is a prepared interface/stub (architecture only). No live calls,
no keys required.
**Consequences:** Works offline at $0, fully demoable; going live later = set a flag
+ free key. Honest "mock prediction engine" that is genuinely smart.

### D-011 — Studio operating model ✅
**Context:** Founder wants the project run as a real studio with full ownership.
**Decision:** Operate via the disciplines and gates in
[OPERATING_MODEL.md](OPERATING_MODEL.md); record decisions here.
**Consequences:** Initiative + coherence + documentation are the default mode.

### D-012 — The original render is the primary, official logo ✅ (supersedes D-008)
**Context:** Founder corrected course: the original 3D render (gold WC trophy in the
ring + chrome "F90+" + lime "+") IS the official identity — aggressive, premium,
stadium/night, glow, broadcast. It must NOT be reinterpreted into a minimal/abstract
mark. Simplified variants may exist for tiny/system cases, but must **derive
visually from the render**, not reinvent it.
**Decision:** Use the render (`public/brand/f90plus-logo.png`, sourced from the
founder's transparent export) as the primary logo on header, hero, loading,
marketing, 404. Generate favicon/app-icon/maskable/OG as **faithful downscales of
the render** via `scripts/brand/generate-icons.py` (Pillow). Restore the "original
glow" on dark surfaces with a CSS gold/lime radial behind the logo. The earlier
hand-authored SVG marks were deleted as off-brand reinterpretations.
**Consequences:** Branding is **raster-first**, 100% faithful to the founder's
render, reproducible via one script. A future true-vector logo, if ever needed, must
be a faithful trace of the render — never an abstract redraw.

### D-013 — No route-level loading boundary on the static homepage ✅
**Context:** A route-level `app/[locale]/loading.tsx` wrapped the homepage in a
Suspense boundary; in dev its reveal stalled (left the page on the loading fallback).
The homepage is static — there's nothing async to load.
**Decision:** Removed `loading.tsx`. Kept the branded loader as a reusable component
(`components/brand/brand-loader.tsx`) to drop into `loading.tsx` for genuinely async
routes later (e.g. live `/matches`). Also made the Analyst section synchronous
(`getMatchInsightSync`, mock-fed) so the page renders fully static with no Suspense.
**Consequences:** The static homepage renders directly and reliably. Loading states
return where there's real async work. (Note: Framer entrance animations are
rAF-driven, so they pause in a backgrounded/hidden tab — content reveals when the
tab is focused; this only affected headless screenshot capture, not real users.)

### D-014 — Real fixtures via openfootball (zero-key) + model probabilities ✅
**Context:** Start the transition to real data, free-first, architecture-first,
with graceful degradation. football-data.org needs an API key (founder's to obtain);
openfootball/worldcup.json is public domain, no key.
**Decision:** `lib/football/` fetches real WC2026 fixtures from openfootball
(cache-first, `revalidate` 6h → page is ISR), normalizes via a team-meta map
(code/accent/strength), and computes **model probabilities** from team strength
(elo) — honest "the model's view," not bookmaker odds. `getHomeMatches()` selects
the opener + 4 marquee fixtures and **falls back to the mock set** on any failure
(never throws). football-data.org adapter is built but **env-gated**
(`COPILOT_SOURCE=live` + `FOOTBALL_DATA_API_KEY`) for standings/form enrichment.
The Analyst analyzes the real opener via `insightFromStrengths` (elo + host
signals) → degrades gracefully (honest "moderate confidence", real drivers only).
**Consequences:** Homepage shows the real Mundial 2026 opener + real marquee
fixtures, real groups/dates. No fabricated odds/community. Adding a football-data
key later enriches automatically — nothing above the source layer changes.

### D-015 — Living atmosphere: curated, ultra-subtle broadcast motion ✅
**Context:** Make F90+ feel alive/cinematic (CL/DAZN/Apple Sports) WITHOUT overload,
casino flash, or particle spam.
**Decision:** A small, high-impact set only: a page-wide `AmbientBackdrop`
(drifting + breathing floodlight glows + a faint broadcast grid), a slow hero text
sheen, refined premium card hover (lift + LED glow), and the existing staggered
broadcast reveals. All GPU-friendly (opacity/transform) and **reduced-motion safe**.
Rejected: pointer-tilt gimmicks, crowd particles, anything loud.
**Consequences:** The whole page sits in a subtle night-stadium atmosphere; motion
adds emotion without noise. Restraint is the rule — new effects must pass the
"would a CL/Apple Sports package do this?" test.

### D-016 — Tool-agnostic & fully portable (no AI/editor lock-in) ✅
**Context:** F90+ must be continuable by **any** AI (Claude, ChatGPT, Codex, Cursor,
Windsurf…) or human team, at any time, with zero dependency on a specific tool —
exactly like the founder's other ecosystems.
**Decision:** Use only **standard, portable** tech (Next.js/TS/Tailwind/pnpm) and
conventions. No proprietary tooling, no AI-specific files in the repo, no obscure
"magic." Onboarding lives in plain Markdown: [README.md](../README.md) +
[AGENTS.md](../AGENTS.md) (the open cross-tool convention) + this docs/ folder.
Data access is via clean swappable adapters; the engine is pure; decisions are
recorded here. (The Claude Code preview `launch.json` lives in the operator's home
dir — never in the repo.)
**Consequences:** The repo can be handed to any AI or developer and understood +
continued immediately. New work must keep this true: prefer standard patterns,
document decisions, keep adapters/boundaries clean.

### D-017 — Cinematic atmosphere via composable CSS/SVG layers (no photos) 🔄 superseded by D-018
**Context:** The page needed more *visual football presence* / match-night depth —
without stock photos (rejected), heavy raster, or overload.
**Decision:** Build a **composable atmosphere layer system** in
`components/atmosphere/` — `StadiumScene` (night sky · distant grandstand crowd
texture · floodlight rig lamps + pools + beams · haze · floodlit pitch with grass +
lines + center circle · color glows · vignette/grain) and a reusable
`BroadcastOverlay` corner mark. All **CSS/SVG** (no images), token-driven,
GPU-friendly (opacity/transform/blur), **reduced-motion safe**. Depth comes from
darkness + light + layering, not literal photos. Art direction = UEFA/FIFA broadcast
packages, Apple Sports, night-stadium photography.
**Consequences:** "World Cup night" presence with zero heavy assets — tiny,
portable, scalable. Layers compose cleanly and are reusable across sections (e.g.
soft grass behind the Analyst). New atmosphere must stay subtle-first and pass the
"broadcast package, not wallpaper" test.

### D-018 — Photo-first hero; procedural "fake stadium" removed ✅ (supersedes D-017)
**Context:** The procedural CSS/SVG atmosphere (crowd dots, grass texture, faux
beams, generated bokeh) read as artificial/"generated". The founder wants REAL
football imagery, cinematically integrated — less fake, more photography.
**Decision:** Removed the procedural fake layers. `StadiumScene` is now
**photo-first**: a real image (`ATMOSPHERE.heroImage`) is the treated cinematic base
(cover · dark grade · soft-light brand tint · fade mask · vignette · grain); when
absent, a clean **dark editorial** mood (no faux stadium). `CinematicImageLayer` +
the manifest make it asset-agnostic. **Honest constraint:** premium soccer-night
photography can't be sourced/generated from this environment (verified: free public
sources are amateur/wrong-sport), so the image is a one-step drop-in by the
founder (AI-generated / licensed) — see [ART_DIRECTION_ASSETS.md](ART_DIRECTION_ASSETS.md).
**Consequences:** No fake textures. The hero is premium + intentional now, and
becomes fully cinematic the moment a real dark image is dropped in — no code change
beyond one manifest line. Kept tasteful vector accents (eyebrow tick, CTA pitch
lines, host identity, broadcast corner) — those are broadcast graphics, not fakes.

### D-019 — Real cinematic imagery integrated (founder-provided) ✅
**Context:** The founder generated and provided real cinematic football images.
**Decision:** Optimized them (WebP, sized — `scripts/assets/optimize-images.py`) and
organized under `public/` (`hero/` · `atmosphere/` · `worldcup/`). Integrated
photo-first via `CinematicImageLayer`: **hero** = night-stadium (low pitch angle,
treated with legibility scrims + grade + vignette); **CTA** = wide stadium (very
dark); **leaderboard** = globe-of-nations key art (faint, thematic); **OG/social**
= globe key art crop. All `next/image`-optimized, responsive, mobile-first, legible.
**Consequences:** F90+ now carries genuine "World Cup night" presence with real
imagery, cleanly integrated. Sources are founder-owned (no stock/licensing issue).
Replacing/adding images = drop a file + one manifest line.

### D-020 — Studio craft bar: maximum-level, premium-or-don't-ship ✅
**Context:** The founder set a standing standard (2026-06-03) for **all** future
phases: F90+ must be built like a complete premium studio producing the **official
digital experience of a World Cup** — never quick solutions, vibe-coding, tech demos,
improvised decisions, or impressive-but-poorly-integrated features.
**Decision:** Every change is executed at **maximum craft across all studio
disciplines** (Creative Director · Product Lead · Art Director · Motion Designer ·
Systems Architect · UX Lead · premium web designer · football-broadcast designer),
using deep reasoning, advanced visual judgment, systems thinking, and premium
composition — and, **by default without being asked**, the full toolbox: tools,
plugins, previews, research, visual comparatives, and *real* validations (browser,
ES/EN, mobile). The studio takes **constant initiative** on visual problems, UX,
atmosphere, composition, motion, legibility and art direction. **Quality rule: fewer
things, done excellently** (depth over speed). **Premium-or-don't-ship:** if a piece
cannot reach the FIFA / Apple Sports / UEFA flagship bar, it is **not forced in** —
it is flagged and a premium path proposed. This sits **on top of** the Definition of
Done and the standing invariants (mobile-first, responsive, GPU-friendly,
reduced-motion safe, portable/tool-agnostic, no lock-in, impeccable docs).
**Consequences:** Premium coherence is the default operating mode; "works
technically" is necessary but not sufficient. Per-feature velocity may be lower by
design. Decisions stay justified and recorded; the experience stays emotionally
coherent. See [OPERATING_MODEL.md](OPERATING_MODEL.md) → "Craft bar".

### D-021 — Dual-surface parity: mobile + desktop, formulated and validated together ✅
**Context:** Founder standing rule (2026-06-03): mobile must **never** be a shrunk-down
desktop. Every decision must be conceived AND validated on mobile and desktop at once;
mobile has to feel equally premium, emotional and broadcast-quality within its limits.
**Decision:** Composition, spacing, motion, glow, overlays and hierarchy are designed
for **real responsive from the first stroke** — accounting for mobile performance,
legibility-over-movement, safe areas, thumb ergonomics, reduced-motion and GPU
stability. On mobile, hero objects (e.g. the globe) must read as the *living presence*
of the World Cup, not a compressed interactive widget. Visual decisions are **validated
on both surfaces at real scale** before they're considered done — every spec/plan
carries the mobile composition as a first-class artifact, not an afterthought.
**Operating creed carried forward:** composition-first · premium-or-don't-ship ·
football-first · atmosphere-before-features · less-but-better ·
emotional-coherence-over-technical-spectacle.
**Consequences:** No "desktop-first then adapt" work. Extends invariant #2 and sits
with the craft bar (D-020).

### D-022 — The hero centerpiece is an interactive 3D globe (direction locked) ✅
**Context:** Founder direction: the hero's featured prediction card is replaced by a
premium, interactive **World Cup globe** as the emotional center and signature symbol
of F90+. Direction chosen via a real comparative (static composition mockups → then a
real three-globe prototype), validated on desktop + mobile.
**Decision:** The hero centerpiece is an **interactive 3D globe** (real
**`react-globe.gl` / three-globe**), replacing the featured `MatchCard`. Locked
direction = **"A+C calibrated per surface"** (broadcast opening sequence + cinematic
immersion): the globe is integrated *into* the night-stadium scene (one scene, not
stacked widgets); copy reads as a broadcast lower-third over a legibility scrim; the
**countdown sits as a pedestal directly under the globe** (more presence than at the
top). Visual base = dark **Earth Night** (city lights) + country **polygons** (defined
borders) + blue **atmosphere** + slow **auto-rotate**, default **POV centered on the
hosts**. **Mobile = emotion-first (option A):** globe (living presence) + countdown own
the first impact; the primary CTA is **hinted just below the fold** (partial/fade),
short natural scroll. Honors dual-surface parity (D-021). The featured opener stays in
the matches rail + Analyst; in-hero it becomes a globe state, not a separate card.
**Consequences:** Validated via a throwaway real-globe prototype (globe.gl via CDN —
operator tooling under `~/.claude`, never the repo). Full contract in
[GLOBE_HERO_SPEC.md](GLOBE_HERO_SPEC.md) (supersedes GLOBE_PHASE_PLAN.md). Build uses
`react-globe.gl` + `three`, client-only (`ssr:false`), error-boundaried, with an image
fallback. Note: animated `ringsData` wedged WebGL screenshotting in the prototype —
host "pulse" must be implemented carefully + perf-tested in the real build.

### D-023 — Globe data fidelity: real states only, no invented ones ✅
**Context:** The validation prototype fabricated team states (e.g. **Italy** shown as
qualified/"favorite" though it is not in the WC2026 field). The founder mandates
**absolute accuracy** — no invented qualified/eliminated nations, no visual predictions.
**Decision:** The globe is a **living official map**. States are **gold = host · green =
officially qualified · red = eliminated during the tournament · neutral = not in the
field**. **No "pending" and no "favorites" state.** The qualified set is read from the
**same real source the app already uses** — `openfootball/worldcup.json` (2026, D-014):
the 48-team field, **verified live** (e.g. **Italy is not in it**), derived from the real
group-stage participants and mapped team-name → country, **never hand-authored**. **Now:**
hosts in gold (most prominent) + **all** officially qualified in green + everyone else
neutral. **During the tournament:** nations turn **red progressively as they are really
eliminated** (from real results); "live" shows only when a match is truly in progress.
green/red change **only when real data justifies it**; unknown → neutral. Arcs/routes are
likewise **real-fixture-driven**. (Resolution note: nations with no polygon in a low-res
geojson — e.g. Cape Verde, Curaçao — appear via point markers / a richer geojson so
**all** qualified nations show.)
**Consequences:** The globe is spectacular **and** rigorously correct — a pure function
of verified real data, **validated against the live openfootball field before painting**.
Expresses invariant #9 (intelligence from real data, honestly) and the no-fabricated-data
rule. **Always verify real data before painting any country.**

### D-024 — The "living World Cup" experience model (unified, not a feature mix) ✅
**Context:** Founder locked the product identity: F90+ is **not** just fantasy / betting /
prediction market / tracker — it **fuses all of it into ONE living experience** where the
user builds their own evolving story during the tournament.
**Decision:** The product rests on **four shared layers** under every pillar — **World**
(the globe + the planet's live pulse), **Identity** (public profile / reputation /
country), **Economy** (virtual coins + points + reputation), **Time** (everything live
with the real tournament). Pillars — predictions · fantasy XI · player portfolio &
discovery · markets · rankings/reputation · narrative · country hubs · live tracking —
all **feed and draw from** those layers. Differentiating layers: **Momentum/Heat** (the
living global pulse), **Discovery** (sleepers / early signings / smart portfolio —
strategic, not arcade), **Narrative/Analyst** (editorial soul over everything),
**Country hubs + country identity**. Vision documented in full; built in coherent slices;
**Phase 1 = first MVP slice**. Full blueprint: [EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md).
**Consequences:** Coherence is **structural** (shared layers), not cosmetic. New features
must plug into the spine or they don't belong. The experience evolves automatically with
the real tournament (data-real, D-023).

### D-025 — Player representation = own IP, zero license dependency ✅
**Context:** Founder: no dependency on fragile official assets/licenses (FIFA/Panini/EA);
prefer an original, recognizable, premium F90+ visual language.
**Decision:** Players are represented with an **original F90+ card system**, **stylized
avatars / composable tokens** (role + nation + accent + number/initials → premium token →
original illustrated portrait), and **own iconography**. **Player names + real stats =
facts** (used by all fantasy, not copyrightable) and are fine; **official crests, kits,
photos and trade dress are avoided**; national flags are neutral symbols.
**Consequences:** A potential copyright liability becomes a **brand moat** — no licensing
cost or fragility, and a distinctive look we fully own.

### D-026 — Elimination is non-punitive; the game stays playable for all ✅
**Context:** Founder changed course on elimination: it must **never** punish or remove a
user from the experience.
**Decision:** If a user's chosen country is eliminated, the user **keeps their account and
every mechanic** (predictions, portfolio, fantasy, rankings) for the rest of the
tournament. **Only the emotional narrative shifts** (their nation is out; the hub mood
changes). **No frustrating or punitive mechanic removes anyone before the final.**
(A country shown "eliminated" = red on the globe per D-023 is a **narrative** state, never
a gate on the user.)
**Consequences:** The World Cup stays alive for **everyone** to the end; engagement is not
cut by real-world results. Country identity adds emotional stakes without lock-out.

### D-027 — Economy: three currencies; earning never costs you rank ✅ (founder-ratified 2026-06-04)
**Context:** The product evolves into predictions + fantasy + ideal XI. The founder's loop
is "predict → get it right → earn points → buy players." A naive single-currency design
(spend the same points you rank on) creates a dark pattern: competing and spending fight
each other. [EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md) §8 already names three concepts.
**Decision:** Formalize **three currencies**: **points** (skill, permanent, feed rankings &
reputation, never spent), **coins** (spendable on players/fantasy moves), **reputation**
(derived, cross-pillar, Phase 4+). A correct prediction credits **both** points (raise
rank) **and** coins (enter wallet). Users spend **coins**, never their rank — so "points
become the economy" without penalizing competition. Both are **append-only ledgers**
(`score_ledger`, `coin_ledger`) with cached projections (`profiles.total_points`,
`wallets.coins_balance`), mutated only by `SECURITY DEFINER` functions.
**Consequences:** Competing and spending are independent axes; the economy is
server-authoritative and tamper-proof by construction. Full spec:
[PHASE_1_IDENTITY.md](PHASE_1_IDENTITY.md), [SCHEMA_V1.md](SCHEMA_V1.md).

### D-028 — Phase 1 = Identity & Accounts on an isolated Supabase; economy foundations latent from day one ✅
**Context:** Identity is layer 2 of the living-World-Cup model and the prerequisite for the
social product. Economic integrity (no negative balances, no client-mutated money) cannot
be retrofitted credibly.
**Decision:** Phase 1 builds auth (F90+'s **own** isolated Supabase, `@supabase/ssr`),
public profiles, favourite-country identity, and the **wallet + append-only ledgers +
`award_*` functions** — even though spending arrives in Phase 3. The points/ranking
skeleton ships as a real (empty) teaser replacing the mock. Forward tables (`fixtures`,
`predictions`, `players`, `squads`, `lineups`, `leagues`) are **designed now, built later**
(see [SCHEMA_V1.md](SCHEMA_V1.md)) so no later phase reshapes Identity.
**Consequences:** A correct, isolated, anti-cheat foundation; adding Predictions/Fantasy/XI
becomes a pure add. Plan: [PHASE_1_IMPLEMENTATION_PLAN.md](PHASE_1_IMPLEMENTATION_PLAN.md).

### D-029 — Roadmap reordered around the loop: Predictions generates the economy, Fantasy spends it ✅ (founder-ratified 2026-06-04)
**Context:** The expanded vision is predictions + fantasy + ideal XI as one daily loop.
The previous roadmap ordered features somewhat independently.
**Decision:** Reorder by loop dependency — **Phase 2 = Predictions Core & Scoring**
(generates points + coins, creates the daily habit), **Phase 3 = Economy: Market + Fantasy
XI** (spends coins), **Phase 4 = Rankings, Leagues & Reputation** (competition + viral
loop), then Narrative (5), Momentum/Heat (6), live/PWA (7). Predictions must precede the
market because the market needs the economy Predictions produces.
**Consequences:** Each phase is fueled by the prior one; no feature ships without its
input. [ROADMAP.md](ROADMAP.md) updated.

### D-030 — Auth methods: magic-link + Google + Apple (studio default, reversible) ✅
**Context:** Choose sign-in methods that minimize friction and fit a global, mobile-first,
future-PWA audience, with no password management.
**Decision:** Email **magic-link** + **Google OAuth** + **Apple OAuth** (Apple needed for
iOS/PWA later), all via `@supabase/ssr` (cookie sessions). GitHub excluded (wrong
audience). Default-and-proceed per [OPERATING_MODEL.md](OPERATING_MODEL.md); reversible.
**Consequences:** Low-friction onboarding; Apple/Google provider config is a small founder
gate after `f90.xyz` connects.

### D-031 — Identity defaults: welcome bonus, mutability, shareable profile, own-IP avatars (studio defaults, reversible) ✅
**Context:** Several reversible Identity parameters needed sensible defaults to unblock the
build without escalating each one.
**Decision:** (a) **1,000-coin welcome bonus** at signup *(superseded by **D-039** → 20,026 Tokens F90)* (seeds the economy; spendable once
the market exists). (b) `username` + favourite **country** are changeable with a **30-day
cooldown** (anti link-rot / impersonation / tribe-hopping). (c) The **public profile is
first-class and OG-shareable** (`/u/[username]`) to power the growth loop. (d) **Avatars
are own-IP composite tokens** (initials + country accent + pattern), never photos —
extends D-025. Default-and-proceed; reversible on founder call.
**Consequences:** Onboarding and the profile are fully specified for implementation; all
four are tunable later without schema changes.

### D-032 — Phase 0.6: the Tournament Center (the pre-user "feel alive" band) ✅ (founder-ratified 2026-06-04)
**Context:** Foundation shipped (f90.xyz live) but the home had no living World Cup content.
With the opener 7 days out (11 Jun 2026), the qualification race is over and the draw is set —
the highest-attention window for World Cup content, and the moment to make F90+ feel alive
*before* Identity (Phase 1) brings users. A pre-Phase-1 mini-phase was approved after a
product audit + implementation SPEC.
**Decision:** Insert **Phase 0.6 — Tournament Center** between 0.5 and 1: a premium band after
the Hero, five modules from **one cache-first openfootball read** (`getTournament()` — the
canonical tournament spine all later phases attach to): **Field Is Set** (count-up
48/12/104/16), **Qualified Nations** (confederation filter + real vendored flags w/ code-token
fallback), **The Draw** (12 groups + the Analyst's "group of the death" from model strengths),
**The Road** (full 2026 bracket R32→Final — desktop wallchart / mobile round-navigator; slot
codes 1A/2B/3A-/W##/L## decoded + i18n'd), **Key Matches** (marquee `AnalystCard` + fixtures
grid). The **Analyst is woven through** groups/bracket/key-matches (founder emphasis:
experience, not a data table). Data fidelity (extends D-023): groups/bracket/fixtures from
openfootball; confederation + flag are **factual reference maps**; live scores/results are
out of scope (V2 live layer). `getTournament()` = pure `parseTournament` + thin fetch wrapper,
never throws, degrades honestly (`source: 'fallback'`). `MatchesRail` + the standalone
`AnalystSection` are **folded into Key Matches and retired**; nav repointed. **Vitest** wired
(per the backlog's "Vitest from pre-flight") — the data layer is TDD'd (34 unit tests). No
auth/Supabase/paid-API/persisted-predictions (those are Phase 1+).
**Consequences:** The home is alive for the tournament's peak window at **$0** (no new paid
dependency), and Phases 1–4 plug into an existing object spine (nations/groups/fixtures/bracket)
instead of inventing one. Build + typecheck + 34 tests green; validated on desktop + mobile,
ES + EN, zero console errors. Branch `feat/phase-0.6-tournament-center` (not yet pushed/merged —
founder gate). Flags vendored from flagcdn under `public/flags/`. Note: the repo's `eslint .`
is broken at the tooling level (no flat-config file; `@eslint/eslintrc` circular-structure) —
**pre-existing and unrelated to this phase** (verified: only Vitest was added; `next` unchanged);
flagged for a separate tooling fix. typecheck + Vitest + build are the effective quality gates.

### D-033 — Vercel reality: F90+ deploys MANUALLY (`vercel --prod`), in Chiribito's Vercel team ✅ (2026-06-04)
**Context:** Phase 0.6 was merged to `main` (`f2be258`) but never appeared on production. A
root-cause audit (2026-06-04) found the deploy assumptions in [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md)
§4/§6 were wrong: pushing to `main` deploys nothing.
**Findings (verified):** (a) The `f90` Vercel project is **not git-connected for auto-deploy** —
GitHub shows 0 deployments / 0 checks on recent commits; the live production deployment had **empty
git metadata** (`githubCommitSha`/`gitSource` all blank) → it was a **manual `vercel --prod`**.
(b) The `f90` project lives in the Vercel team **`chiribito293-7173s-projects`** — the **same team
as Chiribito / xpredict / xprediction-demo**, NOT an isolated F90+ Vercel account (contradicts the
runbook's isolation claim). (c) Canonical domain is **`www.f90.xyz`**; the apex `f90.xyz`
**308→www**.
**Decision:** Until GitHub auto-deploy is connected, **production is published by hand** —
`vercel link --project f90 --yes --scope chiribito293-7173s-projects` then `vercel --prod --yes`
from the repo root (builds the local working tree; aliases `www.f90.xyz`). Phase 0.6 was published
this way (deployment `dpl_ETMNzrovfdWkU3z1meLJUaRvkNLe`, READY; `www.f90.xyz` aliased; EN + ES
verified live). DEPLOY_RUNBOOK updated with a REALITY CHECK + the exact procedure.
**Open governance item (NOT decided — founder call):** migrate `f90` to a truly isolated F90+
Vercel team vs. accept the shared Chiribito team; and optionally connect GitHub auto-deploy
(Settings → Git → Connect `F90Plus/f90`, Production Branch `main`).
**Consequences:** Each phase must be manually `vercel --prod`-ed until auto-deploy is wired. The
"isolated Vercel account" invariant is currently **violated at the team level** and needs a founder
decision. Code isolation (separate repo `F90Plus/f90`) is intact.

### D-034 — Expanded product vision: prediction markets + virtual economy + player trading (designed, not built) ✅ (founder, 2026-06-04)
**Context:** The founder clarified the target vision goes **beyond sports predictions**. F90+ will
also include: **Polymarket-style prediction markets** (no real money), a **persistent virtual
wallet**, a **virtual economy** driven by correct calls + real performance, **player buy/sell** with
**dynamic in-tournament prices**, full **squad building** (starting XI + bench + total team value),
**social rankings + private leagues**, and a **player/asset portfolio**. This refines and extends the
living-World-Cup model (D-024) and the three-currency economy (D-027); most of it is already in the
[SCHEMA_V1.md](SCHEMA_V1.md) forward contract (`players`, `squads`, `lineups`, `leagues`,
`predictions`). The **new** emphasis is a market layer (a price/position per outcome, Polymarket-style)
**on top of** — not replacing — the difficulty-honest 1X2/score/bracket predictions.
**Decision:** **Phase 1 scope is UNCHANGED** (Identity & Accounts only). But every
Identity/auth/profile/wallet/onboarding decision stays **generic and extensible** so these systems
plug in later **without reshaping Identity**. Already true by design and to be preserved: (a) the
wallet + append-only `coin_ledger`/`score_ledger` with generic `(kind, ref_type, ref_id)` absorb
**any** economic source — prediction settlement, market trades, player purchases, fantasy rewards;
(b) `award_coins`/`award_points` (`SECURITY DEFINER`) are the **single, reusable** write path;
(c) `profiles` carry no system-specific fields; (d) auth is provider-agnostic. The Polymarket-style
**market is a NEW subsystem** to design in its own phase (an extension around Phase 2/3): it adds
market/position/settlement tables (AMM vs simple order model — TBD), but reads the **same wallet** and
feeds the **same points** — one character, one economy.
**Consequences:** No Phase 1 rework when markets/portfolio/dynamic-pricing land; the economy stays
server-authoritative and tamper-proof by construction. A dedicated market-design doc + ADR will
precede that build. The 1X2/score/bracket predictions (D-027) and the market layer **coexist** as two
prediction surfaces over one economy.

### D-035 — Auth flows (T4): one dual-mode callback, locale-safe redirects, passwordless login = signup ✅ (2026-06-04)
**Context:** T4 builds the user-facing auth on the T1 SSR clients + T2 trigger. Two real-world
ambiguities had to be resolved: (a) `@supabase/ssr` magic links can return to the app as either
`?code=` (default template / OAuth) **or** `?token_hash=&type=` (token-hash template), and (b) the
flow must preserve the active locale and never become an open redirect. Google OAuth always returns
`?code=`.
**Decision:** (1) **One callback** at `/[locale]/(auth)/callback/route.ts` handles **both** forms —
`exchangeCodeForSession(code)` for OAuth + PKCE magic links, `verifyOtp({token_hash,type})` for the
token-hash template — so magic-link ships **without** requiring a Supabase email-template edit.
(2) Redirect resolution is **pure + unit-tested** (`features/auth/validation.ts`): `resolveSafeNext`
collapses any non-internal `next` (external/`//`/backslash/control-char) to `/`; `localePathname`
re-applies next-intl's `as-needed` prefix in a Route Handler that only sees raw URLs. (3) Magic-link
uses `shouldCreateUser: true`, so **login and signup are the same frictionless passwordless path**
(implements D-030; a new email auto-provisions profile + wallet + 1,000-coin bonus via the T2
trigger — verified end-to-end: a real request created `fan_e1632271` with `coins_balance=1000`).
Email validation is server-side **zod** (`z.email()`), returning stable i18n keys, never raw messages.
**Consequences:** Verified functionally on localhost:3300 — pages render ES+EN (0 console errors),
invalid email → localized error, valid email → "check your inbox" (Supabase accepted), Google → 303 to
the provider authorize URL. **Open config items (founder/dashboard, not code):** Supabase `site_url`
is still `http://localhost:3000` (should become the production origin); the redirect allow-list has
`https://www.f90.xyz/**` + (added this session) `http://localhost:3300/**`, but **not** the apex
`https://f90.xyz/**` — add it before production OAuth/magic-link; production magic-link still needs its
own SMTP (Resend) — dev SMTP is rate-limited. Full Google-consent + email-click completion needs a
real account/inbox (founder), and is the only hop not machine-verifiable headless.

### D-036 — Landing speaks "market" (D-034): live-market ticker in, "Qualified Nations" out ✅ (2026-06-04)
**Context:** The landing communicated too much "World Cup information" and not enough "prediction
market". Per the expanded vision (D-034 — Polymarket-style markets, wallet, player trading, fantasy),
the homepage should start signalling that direction. Separately, the "Qualified Nations" grid ("Las 48
ya están") duplicated the Groups section right below it (which already shows all 48 nations in
context) and consumed a lot of vertical space for little added value.
**Decision:** (1) **Removed** the `QualifiedNations` section and its dead code (`qualified-nations.tsx`,
`nation-card.tsx`, the `tournament.nations` i18n) — keeping `NationFlag` and the `confederations` lib
(still used by Groups + Bracket). The Tournament Center now flows Field-Is-Set → Groups → Bracket →
Key Matches. (2) **Added a live-market ticker** (`features/markets/market-ticker.tsx` + illustrative
`data/markets.ts`) directly under the Hero: a seamless, financial-terminal tape (subject · outcome ·
probability% · green ▲ / red ▼ 24h move), premium not casino — pure-CSS marquee, hover-pause,
reduced-motion-safe. (3) **Values are implied probabilities (Polymarket-style), NOT decimal odds.**
Decimal odds are the language of sportsbooks (an explicit anti-goal), so this deviates from the
founder's illustrative "4.50" examples while honouring the stated anti-betting principle — a trivial
format swap if odds are preferred. (4) Data is **illustrative** (the markets engine is a later
subsystem per D-034/D-035), framed honestly with a "Pronto/Soon" tag + an aria "preview" label,
mirroring the existing leaderboard teaser pattern (`data/leaderboard.ts`).
**Consequences:** The landing now reads as a prediction market within seconds, with a tighter vertical
rhythm. When the real markets engine lands, the ticker swaps illustrative rows for live `markets`
reads with no layout change. Verified: ES + EN + mobile render (0 console errors), `typecheck` + 63
tests + `build` green. Subjects are real teams/players (facts, D-025).

### D-037 — Prediction-market identity LOCKED: probability %, never bookmaker odds ✅ (founder-ratified 2026-06-04)
**Context:** D-036 chose implied probability over decimal odds for the market ticker as an autonomous
call, flagged for confirmation. The founder confirmed and elevated it to a brand invariant.
**Decision:** F90+ markets ALWAYS express implied **probability (%)**, never decimal/fractional/
American **odds**. Probability communicates a prediction market + collective intelligence; odds read
as a traditional sportsbook, which F90+ explicitly is not (a non-goal — see ROADMAP "Non-goals":
real-money betting/payouts/gambling). This governs the ticker, future market pages, player markets,
and any price surface. Movement deltas (▲/▼ %) and "chance" framing are the house language.
**Consequences:** No surface introduces odds, "bookmaker", "bet/wager/stake" framing, or fractional/
decimal price formats. "Predict / chance / market / position" is the vocabulary. Reinforces the
responsible, signal-not-wager positioning across the whole product.

### D-038 — Ecosystem vision recorded + architecture reserved (Entity Layer & Fantasy) ✅ (founder, 2026-06-04)
**Context:** The founder set the long-term direction: per-nation **hubs** (`/nations/<slug>` with
Overview/Players/Stats/Matches/Markets/Predictions), first-class **player profiles**
(`/players/<slug>`), **Fantasy as a visible top-level vertical** (nav → World Cup · Markets · Fantasy ·
Rankings), and a landing **"What is F90+?"** discovery section. Asked for analysis + documentation
only — **no implementation now**.
**Decision:** Recorded in full in [ECOSYSTEM_VISION.md](ECOSYSTEM_VISION.md). It is a **faithful
expansion of D-034** (adds the *navigable entity layer + Fantasy framing + discovery*, no new economic
primitives). Adopt as a recognised milestone cluster **"Phase 3.5 — Entity Layer & Fantasy"**,
**sequenced after** the engine (Phase 2 economy → Phase 3 players/market/XI), since entity pages are
read-models over that data. **Reserve the route namespaces now** (`/nations/[code]/*`,
`/players/[slug]`, `/markets/*`, `/fantasy/*`) so nothing collides. Routes/slugs stay **English**
(D-003) — the ES UI localizes labels, not URLs. The player is the **shared primitive**: one market
price viewed three ways (market value · trading P&L · fantasy value), one wallet, one points total.
**Early wins allowed before the engine:** the discovery section and **read-only** nation hubs
(over openfootball data). **Consequences:** T6+ build *toward* this (and must not reuse the reserved
namespaces). Open questions O-1..O-4 (slug, market model, Fantasy v1 scope, player likeness) are
parked in the vision doc for when the cluster starts. NOT on the critical path for Phase 1.

### D-039 — Currency = "Tokens F90"; welcome bonus = 20,026 (supersedes the 1,000 of D-031) ✅ (founder, 2026-06-04)
**Context:** The generic 1,000-coin welcome bonus (D-031, migration 0001) read as a placeholder. The
founder rebranded the virtual currency to **"Tokens F90"** and set the welcome bonus to **20,026** —
a number that ties to the **2026 World Cup**, carries more personality than 1,000/10,000, and scales
better for future markets / Fantasy / player trading. Tokens F90 remain **virtual** (free-to-play,
no real money, no gambling) — the legal/safety framing is unchanged.
**Decision:** (1) Migration **0003** (`CREATE OR REPLACE handle_new_user`) credits **20,026** via
`award_coins(..., 'signup_bonus', ...)` — applied to the live `f90-production` DB; the trigger
`on_auth_user_created` is unchanged. The economy stays generic (D-034): same wallet, ledger and
`award_coins` — only the amount moved. (2) **Single source** in code: `lib/economy.ts`
(`WELCOME_BONUS_TOKENS = 20_026`, `CURRENCY_NAME = 'Tokens F90'`, 2 unit tests) — **must match the DB
trigger**. (3) **Copy** rebranded "monedas virtuales / virtual coins" → **"Tokens F90"** across the
landing/auth (meta, hero, how-it-works, footer, signup), keeping the virtual/free/no-gambling
disclaimers; the hero chip features the bonus via the constant (`{amount} Tokens F90`, locale-
formatted, no drift). "Tokens F90" is a proper noun — identical in ES + EN.
**Consequences:** Verified E2E — a real admin-created signup fired the trigger → `coins_balance=20026`,
`signup_bonus` ledger `amount=20026`, `balance_after=20026`; auth + onboarding unaffected; typecheck +
74 tests + build green. Internal schema names (`coins_balance`, `coin_ledger`, `award_coins`) stay
generic/unchanged (D-034) — "Tokens F90" is the user-facing brand, not a column rename. Future
balance/wallet UIs read `WELCOME_BONUS_TOKENS` / `CURRENCY_NAME`.

### D-040 — Founding Squad ("Pack Fundación F90") recorded for a future phase ✅ (founder, 2026-06-04)
**Context:** The founder's forward vision: a new user shouldn't start with a full wallet and an empty
team. On first entry they should already **own a starter squad** (XI + bench + a small portfolio)
alongside the 20,026 Tokens F90 — something to *manage* from minute one — with **equal starting net
worth for everyone, no random advantage, and no broken economy**. Asked for analysis + documentation
only; **no implementation, no roadmap change now**.
**Decision:** Full 7-point analysis in [ECOSYSTEM_VISION.md](ECOSYSTEM_VISION.md) §9. Recommend
**"Pack Fundación F90" = value-equivalent squad (B) + light value-normalised favourite-nation flavour
(C)** under a hard **equal-founding-net-worth** rule (20,026 Tokens F90 + an identical-value starter
squad for all). **Equal start, divergent outcomes** is the invariant — flavour changes *who* you
start with, never *how strong*. Fits D-034 with **no new primitives** (provisions `squad_players` +
a default `lineup` server-side at onboarding, like the coin bonus); it is the **on-ramp to Fantasy**.
Adopt as an official design pillar of the Fantasy/economy phase (**Phase 3 / reserved 3.5**),
**built when `players` + the market exist** — designed *with* the engine, not bolted on. Open
questions O-5 (flavour must not bias upside) + O-6 (net-worth split, reveal UX, grant ledger `kind`)
parked in the vision doc. **Consequences:** none now — Phase 1 (T7→DoD) is unaffected; ROADMAP
untouched per the founder's instruction. Reserves the design so Phase 3 can plan for it.

### D-041 — Pre-T9 product/visual refinement: the Analyst Center IS a live market (in place) ✅ (founder, 2026-06-04)
**Context:** Before resuming Phase 1 (T9), the founder asked for a refinement pass on the landing
across four areas: markets, the AI Copilot, Fantasy and the XI Ideal. A first pass overreached by
adding a **separate `#markets` section + nav item**; the founder corrected hard: **no new section,
no new nav, no new grid, no new surface** — the existing section **"Los partidos que importan"**
(`#analyst` / `KeyMatches`) **IS** the market and must be **transformed in place** (same architecture
and layout). "Polymarket inspiration" = the *sensation* of a live market + positioning **inside these
same cards**, never betting terminology. A throwaway HTML mock validated the card direction first; the
founder then chose the action model (**quick F90 chips on single-outcome markets + one "Tomar
posición" CTA on 1X2**).
**Decision:** (1) **Reverted** the standalone `#markets` section + the `markets` nav entry
(net-zero — the liked architecture is restored). (2) **Transformed `KeyMatches` in place** into a
single live-market surface, same layout (hero + secondary grid): the **hero is the evolved
`AnalystCard`** (the real deterministic engine read on the opener — kept server-side so the engine
never enters the client bundle) now carrying market framing — live **participation** (participantes +
"+N hoy") and a **"Tomar posición"** CTA (the opener is a 1X2 market); the **grid is ONE surface**
mixing **outcome `MarketCard`s** (selecciones · jugadores · a narrativa) with quick-chip allocation
(`+10/+50/+100 F90`) and the **fixtures as 1X2 `MatchCard`s** (priced outcomes, the Analyst's lean lit,
single "Tomar posición" CTA). (3) **The Analyst is on every card** — an own-IP identity **mark**
(`AnalystMark`, D-025) + a per-card **conviction** line (`+X% sobre el consenso`). (4) **Vocabulary is
law (extends D-037):** probabilidad · posición · convicción · exposición · asignar F90 · participantes;
**never** apuesta / cuota / stake / bet / ganancias / buy shares / odds. (5) **Honest preview:** the
markets/economy engine is Phase 2/3 (D-034), so every chip/CTA is a preview that routes to **sign-up**
("to take a position, create your profile") — no fabricated balances; the ticker keeps its "Pronto"
tag. (6) **Same pass also** enriched the **Fantasy / XI Ideal** pitch (rich broadcast field, real
markings, nation-accented 4-3-3, gold captain, squad value in F90, "road to the final" framing) — kept
**independent and untouched** per the founder — and added the Analyst identity to the hero header.
Illustrative market data lives in `data/markets.ts` (probability + spark + participants + edge); a pure
`sparkPath` helper is unit-tested.
**Consequences:** No new section/nav/surface — `Hero → TournamentCenter (… → KeyMatches) → HowItWorks
→ FantasyTeaser → LeaderboardTeaser → CtaBand` unchanged. Gates green: `tsc` ✅, **99** unit tests ✅
(incl. 11 new markets tests), `next build` ✅, i18n parity **261/261** (es+en). Verified in-browser:
desktop + mobile, ES + EN, **0 console errors**. Branch `feat/phase-1-identity`, **NOT pushed**, `main`
untouched. The throwaway validation mock (`public/__mock-*.html`) was deleted. **Next: resume Phase 1 at
T9 (rankings).**

### D-042 — Two surfaces: public discovery (Analyst Center) vs private portfolio dashboard (documented, not built) ✅ (founder, 2026-06-04)
**Context:** With the Analyst Center now reading as a live market (D-041), the founder set the forward
product direction — **documentation only, no implementation now** — clarifying that the live-market
feel splits across **two distinct surfaces** with different jobs.
**Decision (reserved, not built):** (1) **Home / Analyst Center = the PUBLIC DISCOVERY surface** —
its job is to **discover opportunities** (World Cup markets + the Analyst's conviction), exactly as
shipped in D-041; it stays public, broadcast, scannable. (2) **The private user DASHBOARD / profile
evolves into a deeper, Polymarket-inspired experience** — *bigger markets, a wallet/cartera, open
**positions**, **F90 exposure**, **entry history**, **conviction**, **performance / P&L**, and
**position tracking***. (3) **Division of labour is the invariant:** **Home = discover opportunities ·
personal dashboard = manage portfolio + reputation.** (4) It introduces **no new economic primitives**
— it is a **read/management view over the same wallet + append-only ledgers + the market layer**
(D-027 three-currency economy · D-034 generic economy absorbing markets/positions · **D-037
probability-not-odds + the no-betting vocabulary law, still binding**). Sequenced **after the engine**
(Phase 2 economy → Phase 3 market/Fantasy → reserved **Phase 3.5 Entity Layer**), so the dashboard is
designed *with* the economy, not bolted on.
**Consequences:** **None now** — pure documentation; Phase 1 (T9→DoD) and the ROADMAP are unaffected.
Reserves the direction so the eventual dashboard phase plans for portfolio/positions/exposure/history
as first-class. The public Analyst Center (D-041) and the private portfolio dashboard are **two views
over one economy, one Analyst, one F90 wallet** — never a second app.

### D-043 — T9: the rankings teaser reads the REAL global board; the mock is deleted ✅ (2026-06-05)
**Context:** T9 (Phase 1) had to replace the fabricated `data/leaderboard.ts` mock (invented aliases
like `laMáquina` + fake 12,480-point totals), consumed by the homepage `LeaderboardTeaser`, with a real
read of the `global_rankings` view (T2). Pre-Phase-2 nobody has scored, so the board must read as an
**honest empty-state**, never fake rows or a wall of 0-point users (the F90+ no-fabricated-data rule;
D-028 "the points/ranking skeleton ships as a real (empty) teaser"). The landing is **public and must
render on a preview deploy with no Supabase env** (D-035 / `a71dc44`).
**Decision:** (1) New `lib/rankings.ts`: a **pure, unit-tested** `toTeaserEntries` (6 tests) that keeps
only ranked players (`points > 0`) — so an all-zero / pre-scoring board projects to `[]` — plus a thin
`getGlobalRankings` adapter. (2) New **cookie-less public Supabase client** (`lib/supabase/public.ts`):
anonymous, **env-guarded** (no env → `null` → empty board, preview-safe), with its `fetch` wrapped in an
ISR `revalidate` window so the homepage stays **cache-first** (D-007) and never forces per-request DB
load; as `anon` it only sees world-readable rows. (3) `LeaderboardTeaser` becomes **presentational**
(`entries` prop): real rows use the **own-IP avatar token** (`avatarColors`/`avatarInitial`, D-025) + the
**nation flag**; the empty-state is a **premium "open seats" podium** (gold ranks, ghost avatar, shimmer,
`—`) over the conversion CTA — honest and aspirational, never fabricated. (4) **Reused the existing
`leaderboard` i18n namespace** (NOT a new `rankings` one — avoids duplication; supersedes the handoff's
"new `rankings` namespace" wording): added `subtitleEmpty`, retuned `title`/`subtitle` to honest framing,
**ES/EN parity**. (5) **Deleted `data/leaderboard.ts`** (sole consumer migrated; grep-confirmed). The
markets ticker (`data/markets.ts`) is now the last illustrative surface.
**Consequences:** No fabricated data on the landing. The board is real and empty today and fills
automatically when Phase 2 scoring lands — **zero rework** (D-028, D-034 generic economy). Gates green:
`pnpm typecheck` ✅, **105** unit tests ✅ (+6 rankings), `next build` ✅ (no `ignore*Errors`); verified
in-browser **desktop + mobile, ES + EN, 0 console errors**, 0 server errors (the real `global_rankings`
read returns the empty board cleanly). **Caveat:** the populated-row branch isn't browser-exercised yet
(no scored users exist) — it is covered by the pure mapping tests + TypeScript, and renders the same
tokens as the verified empty-state. Branch `feat/phase-1-identity`, **NOT pushed** (founder gate).
**Next: T10 (i18n parity + design-token sweep) → T11 (Phase DoD gate) → close Phase 1.**

### D-044 — T10: i18n parity + token/visual/debt sweep (4 parallel audits) ✅ (2026-06-05)
**Context:** T10 (Phase 1) hardens coherence before the DoD gate. Ran four parallel audit subagents —
hardcoded copy · hardcoded design values · visual inconsistencies · minor tech debt. The codebase
audited **clean on DoD** (zero `any`/`@ts-ignore`/`eslint-disable`/`console.*`); findings were few and
concentrated.
**Decision (fixed — coherent with Phase 1, no new product fronts):** (1) **Localised the per-user OG
card** (`u/[username]/opengraph-image.tsx`) — it ignored `locale` and always rendered English; now copy
flows through `getTranslations({locale})` (`common.worldCup`, `profile.pointsLabel`, new
`profile.ogTagline`) and points through `Intl.NumberFormat(locale)`. (2) **i18n ES/EN parity proven
263/263** (added `ogTagline` to both). (3) **Visual consistency:** added `scroll-mt-24` to the four
landing sections missing it (anchor jumps were hiding headings under the sticky header + ticker);
converted `FieldIsSet` to the shared `SectionHeading` (its title was `md:text-5xl` vs every other
section's `md:text-[2.75rem]` — now 44px = the rest); routed the in-card "Tomar posición" CTAs
(`match-card` + `analyst-card`) through `buttonVariants` (restores the signature `glow-led` + system
height/weight). (4) **Dead code:** deleted the retired `MatchesRail` + `AnalystSection` components
(superseded by KeyMatches/TournamentCenter — D-032/D-041; both unreferenced). (5) Fixed a stale comment
(1,000 → 20,026 Tokens F90, `auth/actions.ts`) and typed the `countries` `.select()` in `rankings.ts`
(dropped the `as string` casts).
**Deferred (flagged, NOT changed — with rationale):** (a) `brand.ts` `gold #F4BE54` drifts from the gold
tokens → **brand colour = founder's call** (escalate, not an autonomous fix). (b) `GlobeSkeleton`
gradient literal (`globe-fallback.tsx`) → a sub-second loading skeleton with non-exact-token stops in the
fragile WebGL area; convert via a `.globe-skeleton` CSS class later. (c) the `football-data.ts`
live-adapter cluster (`getHomeMatches`/`getOpenfootballFixtures`/`enrichWithFootballData`/
`getWorldCupStandings`/`footballDataEnabled`) → **documented forward-compat scaffolding (D-010/D-014)**;
remove or wire deliberately, not as a minor sweep. (d) copilot facade orphans (`getMatchInsight`/
`getMatchInsightSync`) → seam reserved for the live/LLM path. (e) `avatar.ts` PALETTE → intentional
own-IP avatar hues (incl. amber/sky with no token), non-CSS, acceptable.
**Consequences:** tighter coherence — the OG card localises, anchors land correctly, section titles and
primary CTAs are system-consistent, and two dead components are gone. Gates: `tsc` ✅, **105 tests** ✅,
`next build` ✅ (no `ignore*Errors`), parity **263/263** ✅; verified in-browser via DOM/computed-style
(FieldIsSet h2 44px = how-it-works 44px; Analyst CTA carries `glow-led` + `h-11`) + the OG route returns
**200 `image/png` in ES and EN**. (Full-page screenshots are blocked by the known WebGL-globe capture
hang — measured via DOM instead, which is conclusive for these properties.) Branch
`feat/phase-1-identity`. **Next: T11 (Phase DoD gate) → close Phase 1.**

### D-045 — Phase 1 (Identity & Accounts) CLOSED: DoD gate passed (T11) ✅ (2026-06-05)
**Context:** T11 is the Definition-of-Done gate for Phase 1. All eleven tasks (T1–T11) are built +
verified; this records the final gate result and the official close of the phase.
**Decision:** **Phase 1 is CLOSED at the development level.** DoD verified end-to-end:
- `pnpm typecheck` clean · **105** unit tests green · `next build` green (no `ignore*Errors`) ·
  i18n **ES/EN parity 263/263**.
- **Browser E2E pass — ES + EN + mobile, 0 console errors:** the landing (6 sections present,
  `scroll-margin-top` uniform 96px, honest titles), auth (`/login` + `/signup` render the magic-link +
  Google forms), the **protected-route gates** (unauth `/home` · `/settings` · `/onboarding` →
  `/login?next=…`), **404s** (unknown profile + unknown route), and the **localized OG card** (200
  `image/png` in ES and EN). Mobile 375px: **0 page overflow**.
- **All 11 OPERATING_MODEL invariants confirmed:** isolation · dual-surface parity · premium-not-casino ·
  WC2026 identity · social-first · free/no-betting (D-037) · clean/scalable · English-product +
  no-hardcoded-copy · no-paid-LLM/data · tokens-over-hardcoding · tool-agnostic/portable.
**What Phase 1 delivers:** Supabase-backed identity on an **isolated** project (auth magic-link + Google ·
onboarding · public profile + dynamic **localized** OG · settings + 30-day cooldown) on a
**server-authoritative, anti-cheat economy foundation** (wallet + append-only ledgers + `award_*`
`SECURITY DEFINER` · welcome bonus **20,026 Tokens F90**) — **generic by design (D-034)** so
Predictions/Market/Fantasy plug in with no Identity reshape — plus a **real (currently empty, honest)**
rankings teaser and a coherence/i18n/token/debt sweep.
**Consequences:** code-complete on branch `feat/phase-1-identity` (pushed; **`main` untouched at
`b6bff60`**; production `www.f90.xyz` still Phase 0.6). **PRODUCTION PROMOTION IS FOUNDER-GATED:**
(1) open a PR `feat/phase-1-identity` → `main` and merge; (2) manual `vercel --prod` (D-033); (3) before
production auth, the Supabase founder/dashboard items — `site_url` → production origin, redirect
allow-list add apex `https://f90.xyz/**`, Resend SMTP for magic-link (D-035). **Next milestone: Phase 2 —
Predictions Core & Scoring** (generates the economy; fills the rankings teaser with real points).
Non-blocking deferred items are in **D-044** + the handoff.

### D-046 — Phase 1 MERGED to `main` + DEPLOYED to production; account features pending env activation ✅⚠️ (2026-06-05)
**Context:** Founder authorized the full Option-A close (PR → merge → production deploy → verify).
**Done:** (1) **PR [#2](https://github.com/F90Plus/f90/pull/2)** (`feat/phase-1-identity` → `main`) opened
via the GitHub REST API (no `gh`/MCP; credential-manager token) and **MERGED** — merge commit
**`7584f65`** on `main`. (2) Local `main` fast-forwarded to `7584f65`. (3) **`vercel --prod`** (D-033
procedure; existing `.vercel` link, team `chiribito293-7173s-projects`, root `apps/web`) → deployment
**`dpl_Dth9c2paTkJkBwi9WauResDUL7iQ`** (READY, target production), **Aliased `https://www.f90.xyz`**.
**Production verification (HTTP):** public surfaces serve **200 with Phase 1 markers** — landing ES (`La
clasificación global`, `Predice el Mundial`, `Tokens F90`) + EN (`The global leaderboard`) + `/login` +
`/signup` (ES & EN). **⚠️ FINDING:** `/home`, `/settings`, `/onboarding`, `/u/[username]` and the OG
image return **500** because **the Vercel `f90` project has NO environment variables** — the
Supabase-touching server routes (cookie client, no env guard) throw without `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. (Phase 0.6 was pre-auth, so prod never had them; Phase 1's env
lived only in the gitignored `apps/web/.env.local`.) **The Phase 1 CODE is correct** (all gates green
locally with `.env.local`); this is purely missing **production env config**.
**PRODUCTION ACTIVATION — FOUNDER-OWNED (secrets boundary; `.env.local` reads are harness-denied):**
1. Add the **two PUBLIC** env vars to the Vercel `f90` project (Production) — values from `apps/web/.env.local`:
   `vercel env add NEXT_PUBLIC_SUPABASE_URL production` · `vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production`
   (runtime uses only these two — both public; the secret key is NOT used at runtime). Then redeploy:
   `vercel --prod --yes`. → fixes all 500s (gates redirect to `/login`, unknown profile → 404, OG renders).
2. For real end-user sign-in (D-035): Supabase `site_url` → `https://www.f90.xyz` · redirect allow-list
   add apex `https://f90.xyz/**` · Resend SMTP for magic-link.
**Status:** Phase 1 = **CLOSED + MERGED + DEPLOYED (code)**; production **public surfaces live**, **account
features pending the founder env activation above**. `main` = `7584f65`; production = Phase 1 code.

**UPDATE 2026-06-05 (env ACTIVATED — 500s resolved):** the founder added `NEXT_PUBLIC_SUPABASE_URL` +
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to Vercel (Production + Preview); **redeployed** `vercel --prod` →
**`dpl_3PDvhVLQBcVe6ZWYpi8N8cQWLa7L`** (READY, `www.f90.xyz`). **All 500s RESOLVED — verified in
production:** `/home` · `/settings` · `/onboarding` → **307 → `/login`** (the `(app)` gate), `/u/[unknown]`
→ **404**, OG → **200 `image/png`** (ES + EN), public landing + `/login` + `/signup` → **200**. Production
now correctly reflects Phase 1 at the surface + architecture level. **Only remaining for real end-user
sign-in: the D-035 Supabase dashboard items** — `site_url` → `https://www.f90.xyz`, redirect allow-list add
apex `https://f90.xyz/**`, Resend SMTP for magic-link.

### D-047 — Post-login navigation fix; auth-state header confirmed working ✅ (2026-06-05)
**Context:** After Google login in production the founder reported "no visual indication of an
authenticated user." Systematic investigation: prod cache headers proved the landing is **fully dynamic**
(`Cache-Control: no-store`, `X-Vercel-Cache: MISS`, `Age: 0`) — **not** cached; `git log` confirmed **no
regression** from T9–T11 (the auth flow is untouched since T4–T8); the header (`getCurrentUser`) and the
`(app)` gate (`requireOnboardedUser`) make the **identical** `createClient().auth.getUser()` call. Founder
screenshots then **CONFIRMED the header DOES reflect the session** (avatar "P" + "Sesión iniciada como
…@… / Cerrar sesión", on both the landing and `/settings`).
**Root cause:** NOT a session / cookie / caching bug — a **missing navigation affordance**. The user menu
only offered email + sign-out, so the authenticated areas (`/home`, `/settings`) were **unreachable from
the UI** (the user had to type the URL).
**Fix (no new features — the pages already existed):** (1) `components/layout/user-menu.tsx` — added
locale-aware links **Inicio (`/home`)** + **Ajustes (`/settings`)** above sign-out (i18n
`auth.account.home`/`settings`, ES/EN; parity **265/265**). (2) `app/[locale]/(auth)/login/page.tsx` — the
post-login destination now defaults to **`/home`** (the `(app)` gate still routes not-yet-onboarded users
to `/onboarding`; a gate-supplied `?next=` is preserved). **Gates:** typecheck · 105 tests · build green.
**Deployed:** `dpl f90-pef578soh`, `www.f90.xyz`, commit `201fe66`.
**Flagged latent (NOT the cause here; NOT fixed — no evidence it's biting):** `lib/supabase/middleware.ts`
`updateSession` writes refreshed cookies only to the **response**, not back onto the **request** — a
deviation from the canonical `@supabase/ssr` pattern that can make server components miss a *refreshed*
session after access-token expiry (~1h), i.e. a possible later "unexpected logout." Address deliberately
if that symptom appears (needs an authed-session repro; the composed next-intl + Supabase middleware makes
the change non-trivial, so it was not done blind). **→ RESOLVED in D-049** (Phase 2 pre-flight, commit `c4dee71`).

### D-048 — Phase 1 (Identity & Accounts) OFFICIALLY APPROVED & CLOSED ✅ (founder, 2026-06-05)
**OFFICIAL STATUS: CLOSED · MERGED · DEPLOYED · ENV ACTIVATED · PRODUCTION VERIFIED.** Founder-approved.
This is the authoritative close snapshot; a fresh session resumes Phase 2 from here.

**Production state** — `www.f90.xyz` LIVE on Phase 1 (latest prod deployment `dpl f90-pef578soh`; `main`
docs at `eaffd61`). Verified: public landing ES/EN (real-but-empty rankings teaser · market ticker ·
Analyst Center live-market) · `/login` + `/signup` · protected-route gates (`/home`·`/settings`·
`/onboarding` → `/login`) · `/u/[unknown]` → 404 · localized OG (200, ES/EN) · **auth-aware header + user
menu (avatar + Inicio/Ajustes/Cerrar sesión) working** (D-047). Real end-user **sign-in completion pending
D-035** (Supabase `site_url` → `www.f90.xyz`, redirect allow-list apex `https://f90.xyz/**`, Resend SMTP).

**Supabase state** — project `f90-production` (ref `upelxcxnpmmbhivrazle`, eu-west-1, **isolated**,
ACTIVE_HEALTHY). Migrations `0001`/`0002`/`0003` applied + verified: 5 tables (RLS on all),
`award_coins`/`award_points` (SECURITY DEFINER), `handle_new_user` trigger, `global_rankings` view, 48
countries, welcome bonus **20,026 Tokens F90**. Vercel env (Production + Preview): `NEXT_PUBLIC_SUPABASE_URL`
+ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set (runtime needs only these two **public** vars; the secret key
is NOT used at runtime).

**Git state** — `main` @ `eaffd61` == `origin/main`; **tree clean**; **only `main`** (feat/phase-1-identity
deleted local+remote); PR [#2](https://github.com/F90Plus/f90/pull/2) merged (`7584f65`). No stashes, no
temp branches, no running processes/tasks.

**Inherited decisions (binding)** — D-027 three-currency economy · D-034 generic economy (markets/players/
fantasy plug in with no Identity reshape) · **D-037 probability-NOT-odds LOCKED** + the no-betting
vocabulary law · D-039 Tokens F90 (20,026) · D-035 auth (one dual-mode callback) · D-041 Analyst Center =
live market in place · D-042 two-surfaces (future) · D-043 real rankings teaser · D-044 i18n/token sweep ·
D-045 close · D-046 ship/env · D-047 post-login nav.

**Known risks** — (1) **D-035 prod auth config pending** → end-users can't fully complete sign-in until set
(founder). (2) **Latent (D-047):** `updateSession` writes refreshed cookies only to response, not request
→ possible "unexpected logout" ~1h after token expiry. **RESOLVED in D-049** (Phase 2 pre-flight, commit `c4dee71`).
(3) Vercel team **shared with Chiribito** (D-033). (4) ESLint flat-config gap (pre-existing; typecheck +
tests + build are the gates). (5) WebGL globe screenshots flake in tooling (verify via DOM).

**What NOT to touch in Phase 1** — the identity/auth/economy schema + RLS + `award_*` (server-authoritative,
generic, anti-cheat) · the Analyst Center landing (D-041) + vocab law (D-037) · the rankings teaser
contract · the design tokens + the 11 invariants · the deployed auth surfaces. Do NOT re-open **D-042
dashboard / advanced Fantasy / player-market** (future, documented-not-built).

**Phase 2 starts here** — milestone **Phase 2: Predictions Core & Scoring**, on a fresh branch
`feat/phase-2-predictions` off `main`: migration `0004` (`fixtures` + `predictions`, designed in
[SCHEMA_V1.md](SCHEMA_V1.md)) · predict flow (winner / scoreline / brackets) **locking at kickoff** ·
**difficulty-honest scoring** (`lib/football/model.ts`, underdog-correct = more points) · **server-side
settlement** → `award_points`/`award_coins` · a "my predictions" view. This **generates the economy and
fills the rankings teaser with real data**. WC opener: **11 Jun 2026**.

### D-049 — Phase 2 pre-flight: latent middleware session-cookie bug FIXED (TDD) ✅ (2026-06-05)
**Context:** D-047 flagged a latent deviation in `lib/supabase/middleware.ts` `updateSession`: it wrote
refreshed session cookies only onto the **response**, not back onto the **request**. On the request where an
expiring access token rotates (~1h), the current request's Server Components would read the stale/rotated
token and render signed-out for that one request — a possible "unexpected logout." Phase 2 is
authentication-heavy (predict flow, lock-at-kickoff, "my predictions"), so this is fixed first, on clean
ground, before building on top.
**Investigation (systematic, confirmed against real code):** `setAll` had only `response.cookies.set`;
`proxy.ts` runs next-intl first (it owns the response), then `updateSession` writes onto that same response.
Canonical `@supabase/ssr` contract = refreshed cookies must reach **both** the request and the response.
**Fix (TDD, RED→GREEN):** added `request.cookies.set(name, value)` alongside `response.cookies.set(...)` in
`setAll`; the composed-middleware shape (next-intl owns the response) is preserved — no response recreation.
New unit test `src/lib/supabase/__tests__/middleware.test.ts` simulates a token refresh and asserts both
sinks receive the cookie (RED on the missing request write → GREEN after the fix) + an env-guard
preview-safe case.
**Gates:** 107 vitest (105 + 2 new) · `tsc --noEmit` · `next build` (Proxy middleware compiles). Commit
`c4dee71` on branch `chore/phase-2-preflight`.
**Honest limit:** the unit test proves the canonical contract; the definitive E2E ("the current request's
Server Components see the fresh session at the token-expiry minute") needs a live authed session and is
validated in prod once D-035 sign-in is active. The fix is strictly correct vs. the prior state.

### D-050 — Predictions are server-authoritative via the `make_prediction` SECURITY DEFINER RPC ✅ (2026-06-05, Phase 2 / P2-1)
**Context:** the planned Phase 2 had the predict action upsert predictions via the user's RLS client, with
`points_possible` set by the action. An adversarial security review of migration `0004` found this left
`points_possible` (and `settled_at`/`awarded_*`) **client-writable on INSERT** — a user could bank inflated
points on a correct call (a leaderboard-integrity hole, though never a direct wallet credit since `award_*`
are definer-only). The same review caught that **`prediction_kind` was never created in Phase 1** (0001 made
only `ledger_kind`), so `0004` could not apply.
**Decision:** make predictions **server-authoritative**, mirroring the economy's `award_*` definer pattern.
Clients get **SELECT only** on `predictions`; the **sole write path** is `make_prediction(p_fixture_id,
p_outcome)` — `SECURITY DEFINER`, `set search_path = public`, EXECUTE to `authenticated` only. It validates
the caller (`auth.uid()`), enforces the kickoff lock, reads the fixture's stored model probability
(`fixtures.prob_home/draw/away`), computes `points_possible = clamp(round(20 / prob), 10, 500)` server-side,
and upserts the caller's single pick. `prediction_kind` is created in `0004` (idempotent). **No runtime
service key needed** (the RPC is definer; the user's session calls it). The economy mechanic is **unchanged**
(free predict → earn on a correct call). Migration `0004` re-reviewed **APPROVED** (no cross-user write,
kickoff fail-closed, no client-settable settlement columns, `anon`/`public` execute revoked, no dynamic SQL).
Commits `63c5561` + `f509042`.
**Consequences (carry-forward):** the fixtures sync (P2-2) must **compute + store `prob_*`**; the predict
action (P2-4) **calls the RPC** (not a client upsert); `lib/scoring.ts` (P2-3) mirrors the canonical formula —
keep SQL ↔ TS parity. A live-DB integration test of `make_prediction` (cross-user / post-kickoff /
settled-repick) is recommended once the DB is operator-applied.

### D-051 — Phase 2 (Predictions Core & Scoring) built: the full loop, code-complete + DoD-passed ✅ (2026-06-05)
**What:** the **predict → lock-at-kickoff → settle → points/Tokens → ranking** loop is built on
`feat/phase-2-predictions` (NOT yet merged/deployed). Predict card + position ticket (real flags, optimistic
1X2), premium `/home` hub (subtle WC atmosphere + intentional branding), `/predictions` + `/ranking` pages,
migrations `0004` (fixtures/predictions/`make_prediction`) + `0005` (`settle_fixture`), admin sync/settle
routes. Gates: **243 vitest · tsc · next build · i18n parity 343/343 · vocab D-037 upheld · zero forbidden
patterns**. Every integrity-critical unit adversarially reviewed (caught: the missing `prediction_kind` enum,
the `points_possible` client-write hole → D-050, the re-sync `status`-clobber, settlement double-award
checks). Full record + the **operator runbook**: [PHASE_2_HANDOFF.md](PHASE_2_HANDOFF.md).
**Engagement/visual craft direction (founder-approved):** the predict surface should feel
**credible-money-adjacent / market-alive** at the sophistication of the best prediction-market products
(Polymarket / Kalshi / DraftKings) — **adapted, never copied**, never a sportsbook, **zero dark patterns**,
vocab law intact. Pre-community, **El Analista (the real model) IS the market**, and consensus-vs-contrarian =
**you vs the Analyst's lean** (challenging it pays more, by the honest scoring). Community-data mechanics
(crowd split, live activity, probability movement, per-outcome sparklines) are **honest-deferred** until real
predictors exist — no fabricated counts (the documented dark patterns are explicitly avoided). **Real flags**
replace the initial-token boxes.
**Post-loop craft trajectory (deferred — after the loop is live + has real use):** the sidebar app-shell,
"Analista Élite / XP" levels, the trophy-photo header, and per-outcome community sparklines (the founder's
reference render). Deferred deliberately for pace + the ruta crítica al opener.
**Deploy = founder-gated production promotion + operator steps** (apply `0004`/`0005` · set
`ADMIN_SYNC_SECRET` + `SUPABASE_SECRET_KEY` · D-035 sign-in items · merge + `vercel --prod` · sync pre-opener ·
settle post-match). See the runbook in [PHASE_2_HANDOFF.md](PHASE_2_HANDOFF.md).

### D-052 — Phase 2 MERGED to `main`; only operator deploy steps remain ✅ (founder, 2026-06-05)
**Final technical close.** Founder reinforced the autonomy directive: execute everything within operational
capacity by default (incl. merges of clean reviewed PRs); escalate only product-strategy/scope/economy/
branding/visual direction or actions that **genuinely require credentials/environments not held** — and a
credentials gap alone never blocks a technical phase close. Distinguish "not verified" as: (1) doesn't exist
(real gap) · (2) lacks environment access (not a blocker) · (3) needs real production (operator step). The
directive is persisted in [[feedback-f90plus-studio-ownership]].
**Actions taken under this directive:** PR [#4](https://github.com/F90Plus/f90/pull/4) (`feat/phase-2-predictions` → `main`)
**MERGED** via the GitHub REST API — merge commit `2d3dc37` (17 commits, 49 files, +5147/-80). Local + remote
synchronized; the feature branch deleted (local + remote); **only `main` remains**; tree clean. Gates
re-verified on `main`: **243 vitest passing · `tsc --noEmit` clean · `next build` green · i18n 343/343 · vocab
D-037 upheld · zero forbidden patterns**. Docs swept post-merge (ROADMAP / PROJECT_STATE / PHASE_2_HANDOFF
banners now reflect "merged to `main`, deploy operator-gated" — not "on branch"). Memory updated with the
final close + the Phase 3 startup pointer.
**What remains (all operator/production-gated — type 2 + 3 per the directive):** Apply migrations `0004`+`0005`
to Supabase `f90-production` (SQL Editor or Management API + PAT) · set Vercel env `SUPABASE_SECRET_KEY` +
new `ADMIN_SYNC_SECRET` (Prod + Preview) · complete the **D-035** Supabase dashboard items (`site_url` →
`www.f90.xyz`, redirect allow-list apex `f90.xyz/**`, Resend SMTP) · `vercel --prod` (D-033 — manual deploy,
shared Chiribito team, root `apps/web`) · `POST /api/admin/sync-fixtures` (~72 fixtures, pre-opener) ·
`POST /api/admin/settle` (post-match — idempotent). Full runbook: [PHASE_2_HANDOFF.md](PHASE_2_HANDOFF.md).
**Phase 2 = TECHNICALLY CLOSED. Next milestone = Phase 3 (Economy: Market + Fantasy XI).**

### D-053 — Phase 2 Polish & Production Cohesion Pass: implemented + gated (deploy founder-gated) ✅ (founder-approved scope, 2026-06-05)
**Context:** before opening Phase 3 the founder asked for a serious, professional close of Phase 2 —
turning it from "it works" to "it feels like a finished product". A focused audit of the real deployed
product (3 parallel static-audit subagents over the 6 founder-named areas — dashboard/home · navigation ·
predict flow · save/edit feedback · kickoff-lock states · visual cohesion/branding — cross-checked by
reading the live `www.f90.xyz` HTML and the source) surfaced ~36 actionable findings + 6 Phase-3 candidates.
The founder approved scope = **narrow (shipped surfaces only)**, set hard guardrails (no new product
surfaces · no new systems · don't reopen D-051's deferred craft trajectory · anything needing new
functionality → **Phase-3 candidate, not implemented**), and chose the **Recommended** fix set + a
**static-now → preview-deploy-at-the-end** access path for runtime verification.
**Decision (built on branch `feat/phase-2-polish`, 4 atomic commits):**
- **Navigation (auth-aware shell).** The authenticated UI reused the landing's anchor nav (`#tournament`…),
  so signed-in users had broken/dead-end nav and, on mobile, no way to reach Predictions/Ranking. Fixed:
  header renders real route links when signed-in (locale-aware `Link`), logo → `/home`, acquisition CTA
  hidden; the account menu now carries the full authenticated nav (Inicio · Predicciones · Ranking · Mi
  perfil · Ajustes) so every surface is reachable in the mobile thumb zone; ranking rows + the account menu
  link to the public profile `/u/[username]`; the two `/#tournament` "see-all" links (which ejected the user
  to the marketing landing, redundant since every fixture is already on `/home`) were removed; the footer is
  a slim route-linked utility footer when signed-in (the not-gambling disclaimer kept).
- **Predict flow (commitment & feedback).** In-flight "Confirmando…" state on the optimistic ticket;
  **reactive kickoff lock** (a single `setTimeout` flips the card to its locked state exactly at kickoff if
  the tab is open across it, instead of a tap bouncing off a server rejection); a **closed-market hero**
  when locked with no pick (no dead tappable picker); **clearer change-pick** (a banner names the
  still-saved current position + a "Current" tag + Cancel, so it no longer reads as an erase); lock-vs-pending
  are now distinct states by construction; real minutes near kickoff (dropped `unit:'hour'`); pre-pick
  group/kickoff context on the predict card.
- **/home premium + cohesion.** **Atmosphere de-dup** — `HomeAtmosphere` had an opaque `bg-night-950` that
  fully **occluded** the shared page-wide `AmbientBackdrop` and re-implemented the same grid/glow recipe;
  it is now a thin transparent ACCENT overlay (globe + scrims) over the single shared ambient. *(Note: the
  audit's HOM-001 premise of "doubled grid / summed opacity" was empirically wrong — the opaque bg meant
  occlusion, not doubling; the fix — one source of atmosphere, less code — still holds.)* Score-first
  standing strip (Puntos leads, Ranking is a clear link with a hover affordance + honest dim unranked tone,
  Tokens last); honest always-true featured eyebrow ("Partido destacado" — the hardcoded "La jornada
  inaugural" was false for any non-opener); a route-level loading skeleton; distinct "Mis predicciones"
  empty-state (ticket glyph + a CTA that scrolls to the predict hero); resolved-row reveal (inline scoreline
  + a quiet pitch-green elevation on correct calls — replacing the below-row pill that broke <360px);
  AA-contrast bumps on sub-12px labels.
**Guardrails upheld:** zero new routes/tables/systems; D-051 deferred craft (sidebar app-shell · Analista
Élite/XP · trophy-photo header component · per-outcome community sparklines) **not reopened**; **D-037 vocab
law intact** (the only `odds/stake/bet/apuesta` strings are the anti-betting disclaimers + JSDoc that forbids
the terms). **Gates:** `tsc` clean · **243 vitest** green · `next build` green (no `ignore*Errors`, 23/23
static pages) · i18n ES/EN parity **353/353**. Diff: 15 files, +531/−217.
**Consequences / status:** the polish is **code-complete + gated on `feat/phase-2-polish`, NOT yet
pushed/merged/deployed.** Per the founder's chosen flow + the standing deploy caution (D-033 manual deploy,
shared Chiribito team, push/prod founder-gated): next = **preview deploy → founder verifies authenticated
ES/EN/mobile → push + PR + merge + `vercel --prod`**. Phase-2 visual confirmation with live data (flagged
open in [PHASE_2_HANDOFF.md](PHASE_2_HANDOFF.md)) happens at that preview. The 6 Phase-3 candidates are
captured in [PHASE_3_CANDIDATES.md](PHASE_3_CANDIDATES.md) (do not implement before Phase 3). **Phase 2 is
not "officially closed" until the preview is founder-verified and prod is deployed; only then does Phase 3
start.**

### D-054 — Commitment & value of a prediction (without a wager) + the WC-trophy atmosphere; free staking deferred to Phase 3 ✅ (founder, 2026-06-05)
**Context:** verifying the D-053 branch, the founder felt navigation/polish had improved but the predict
experience "still doesn't transmit enough that I'm putting something on the line." Asked specifically about:
Tokens visibility (Home + predict flow), clarity of the current position, the felt commitment of taking a
position, the points/ranking/Tokens hierarchy, and what info on the cards makes a decision feel meaningful —
**and to honestly judge whether free staking (choosing any amount of Tokens per prediction) is Phase-2 polish
or Phase-3 Economy.** Plus: integrate the founder-provided **World Cup trophy** image as premium Mundial
atmosphere (not a logo, not dominant).
**Decision — the stake is REPUTATIONAL, surfaced; not a wager.** In F90+ what's on the line is your
**points · ranking · record vs El Analista** — Tokens are *earned* on a correct call, never staked (D-051).
So the commitment is raised by making that honest stake legible, not by adding risk (commits on
`feat/phase-2-polish`):
- **P-A** — the reward is visible **before** choosing: each outcome button shows the dual reward a correct
  call earns — points (rank) **+ Tokens F90** (wallet) — so the value is concrete at the decision moment.
- **P-D** — Tokens get their own presence in the flow, rendered in the currency's **lime** (distinct from
  points' pitch) on the buttons + the ticket reward block. Points stay the hero in the *identity* strip
  (D-053 H4); the reward leads in the *predict* surface — contextual hierarchy.
- **P-C** — the **difficulty↔reward rule** is explicit ("less likely → more points and Tokens"), so each
  pick is a stance, not an arbitrary number.
- **P-B** — what's at stake is **named**: the position ticket states it counts toward your **record and
  ranking**, alongside the existing lock-at-kickoff permanence.
**Staking verdict (founder-confirmed): free staking = Phase 3 / Economy, NOT this PR — and a brand-invariant
risk.** It is a new mechanic (variable amount → new columns/payout/balance-deduction/settlement/anti-cheat =
Economy), it changes the free-to-predict model (D-051), and "choose how much to risk" is the core gesture of a
sportsbook — directly against **D-037** (probability-not-odds) + the free/no-betting invariant + the casino-
look the founder wants to avoid. Captured as a candidate in [PHASE_3_CANDIDATES.md](PHASE_3_CANDIDATES.md);
**not implemented.** The desired feeling is delivered by P-A..P-D instead.
**Trophy atmosphere.** The WC trophy is added as a **single aspirational atmosphere** on **/home only**:
towering behind the content, ~7% opacity + blur + a soft radial fade, with a faint gold prestige glow tying to
the F90+ gold; the legibility scrims keep the predict cards + stats the protagonists. It **replaces** the
near-invisible globe-flags accent. **It is atmosphere, never a logo** (the F90+ mark stays the brand), never on
the cards, not repeated across the app — no casino, no promo look. Asset = founder-provided transparent cutout,
optimized to WebP (399×1020, 76KB, alpha) under `public/worldcup/`; the dark/low-opacity/blur/fade treatment is
CSS, not baked in. **IP note (honest):** the real WC trophy is FIFA trade dress, which D-025 avoids for
license-independence; as a **subtle, dark, non-logo atmosphere** the exposure is low, but prominence is a
**founder brand call** — flagged, not blocked. Intensity/placement are single knobs if a tuning pass is wanted.
**Consequences:** scope held — no wager, no multipliers, no new tables/routes/systems, no Economy logic;
**D-037 intact.** Gates green (`tsc` · 243 vitest · `next build` · i18n parity **356/356**). Same gated close as
D-053 (preview → founder-verify → PR → merge → `vercel --prod`). Free staking is the one item explicitly
parked for Phase 3 brand+economy evaluation.

### D-055 — Autonomous merge→deploy when a PR meets the quality bar (supersedes the D-033 manual gate) ✅ (founder standing directive, 2026-06-05)
**Context:** the founder set a standing operational preference: **no manual stop between merge and production
deploy** once a change clears the quality bar. Extends the studio-ownership/autonomy posture
([[feedback_f90plus_studio_ownership]], D-052) to the deploy step.
**Decision:** when a PR is **(1) reviewed · (2) merge-ready · (3) all gates green · (4) build green ·
(5) docs reconciled · (6) no open blockers**, the studio executes the **full flow autonomously, including the
production deploy** — no per-deploy approval. **Preferred flow:** implementation → gates → PR → review → merge →
**deploy prod** → verification → checkpoint. **Stop ONLY for:** a real risk, a product doubt, a scope decision,
or a technical incident. This **supersedes the manual-approval gate of D-033** for the deploy step. **D-033's
technical reality is unchanged** (production is published by `vercel --prod` — manual command, **shared Chiribito
Vercel team** `chiribito293-7173`, root `apps/web`, not git-connected); what changes is that the studio now
**runs that command autonomously** under the bar above instead of waiting for a click. The cross-ecosystem
isolation invariant still holds — `f90` + `www.f90.xyz` are isolated from Chiribito at the project/domain level;
deploying F90+ never touches Chiribito.
**Consequences:** faster cadence; the **quality bar is the gate**, not a manual approval. Recorded in
[OPERATING_MODEL.md](OPERATING_MODEL.md) (deploy posture + Cadence) + the studio-ownership memory. Secrets rule
unchanged (never store/print the PAT or keys). Governs **F90+ only** — Chiribito keeps its own
explicit-confirm-every-deploy rule; the ecosystems are independent.

### D-056 — Phase 2 (incl. the polish pass) MERGED + DEPLOYED; Phase 2 operatively CLOSED ✅ (2026-06-05)
**What:** under D-055, the Phase 2 Polish pass was merged and shipped autonomously after clearing the bar.
- **PR [#5](https://github.com/F90Plus/f90/pull/5) MERGED** → `main` (merge commit `372072c`); feature branch
  deleted (local + remote); **only `main`** remains; `main` == `origin/main` == `372072c`; tree clean.
- **`vercel --prod`** → deployment **`dpl_DNiLgBUgPKNAUcy5MXpyBQbor4rS`** (READY, target production), **aliased
  `https://www.f90.xyz`**.
- **Production verified (HTTP):** `worldcup/trophy.webp` → **200 image/webp 76,106 B** (proof the polish is live —
  the asset exists only in this deploy) · landing ES + EN → **200** · `/home` · `/predictions` · `/ranking` →
  **307 → `/login?next=…`** (auth gates, no 500) · `/u/[unknown]` → **404**. The authenticated polish (trophy on
  /home, auth-aware nav, predict commitment UI) is in this deploy; first founder visual on `www.f90.xyz`.
**Status:** **Phase 2 (core PR #4 + polish PR #5) is OPERATIVELY CLOSED.**
**Remaining (operator/data — NOT blocking the close):** the predict→settle→ranking **loop goes live with real
data** only after the operator runbook — apply migrations `0004`/`0005` to `f90-production`, set `ADMIN_SYNC_SECRET`
(+ `SUPABASE_SECRET_KEY` where the admin jobs run), the **D-035** sign-in items (`site_url` → `www.f90.xyz`,
redirect allow-list apex `f90.xyz/**`, Resend SMTP), then `POST /api/admin/sync-fixtures` (pre-opener) +
`POST /api/admin/settle` (post-match). Until then the predict surfaces show the honest empty-state. Full runbook:
[PHASE_2_HANDOFF.md](PHASE_2_HANDOFF.md).
**Next milestone = Phase 3 (Economy: Market + Fantasy XI).** Free staking is its first brand/economy evaluation
(PHASE_3_CANDIDATES C3-7).

### D-057 — Quality & Hardening Pass: ESLint gate restored + a11y/UX polish (no new fronts) ✅ (2026-06-06)
**Context:** Phase 2 is operatively closed (D-056); its remaining items are operator/credential-gated
(migrations `0004`/`0005` · `ADMIN_SYNC_SECRET` · D-035 sign-in · admin jobs — **not code**, and not
runnable from the build harness). Phase 3 (Economy) is gated behind "loop live + verified" (D-042) and opens
with a **brand/economy** decision (free staking, PHASE_3_CANDIDATES C3-7) that needs explicit founder
ratification — an escalation trigger, not autonomous work. The highest-value work that respects those gates was
a **production-quality hardening pass** over the shipped surfaces: restore the broken lint gate and clear
in-scope items from the audit backlog (PHASE_3_CANDIDATES "Optional polish backlog" + the ROADMAP a11y line),
with **no new product surfaces/systems**.
**Decision (branch `chore/quality-hardening-pass`, 6 atomic commits):**
- **Lint gate RESTORED (the headline).** `eslint.config.mjs` bridged the shareable config through
  `FlatCompat` + `@eslint/eslintrc`, which crashed ESLint 9 ("Converting circular structure to JSON") — so the
  repo had **no working `pnpm lint`** (typecheck + Vitest + build were the de-facto gates). Migrated to
  **eslint-config-next's native flat config (v16)** and fixed the **4 `react-hooks/set-state-in-effect`** errors
  it surfaced, each behaviour-preserving: `countdown` (null-init + `setTimeout(0)` kick, drops the mount-gate
  boolean), `predict-positions` (fold the kickoff-passed branch into `setTimeout(max(0,ms))`), `stat-counter`
  (derive the reduced-motion/off-screen value during render), `onboarding-form` (store only the tagged async
  result; derive idle/checking). `pnpm lint` is now a real **4th gate, 0 problems**, rule kept at full strength.
- **a11y:** a **skip-to-content link** (sr-only → LED pill on focus; `<main id="main-content" tabIndex={-1}>`),
  new `common.skipToContent` ES/EN. (Focus-visible rings were already global in `globals.css` — no change.)
- **Auth UX:** the **login↔signup switch preserves a meaningful `?next=`** deep-link (skips each page's own
  default — login `/home`, signup `/onboarding` — so a fresh signup still lands on onboarding); the account-menu
  **sign-out shows a `useFormStatus` pending state** and stays mounted (`aria-disabled`) for focus retention.
- **Responsive:** the **PredictCard team line stacks per-team on <375px** (no double-truncation) and keeps the
  symmetric flag-bookend from `sm` up.
- **DRY:** a shared **`<Eyebrow>` primitive** replaces the copy-pasted `.eyebrow` span across `SectionHeading` +
  4 routes (one source for the class; the hero `<Badge>` left as-is).
**Verification:** all four gates green — `tsc` clean · **243 vitest** · **`eslint .` 0 problems (newly working)** ·
`next build` (23/23). Browser-verified on the public surfaces (countdown ticks real values; stat-counters reach
48/104/16; eyebrows render; skip link 1×1 when blurred → focus pill; `?next=` carried as
`/en/signup?next=%2Fsettings`; **0 console errors**; no 375px overflow). The **auth-gated** surfaces (predict
card, standing strip, sign-out) are code + gate verified; their live render awaits the operator-gated loop (the
documented "not visually verified with live data" caveat — type 2/3 per D-052, not a code gap).
**Consequences:** a working lint gate (it immediately caught real cascading-render patterns) plus a cleaner,
more accessible, more responsive shipped surface — **zero new product fronts**, D-037 vocab law and
D-042/D-051 deferrals untouched. Shipped under **D-055** (merge→deploy on a met quality bar). **Left as-is
(flagged):** the standing-strip tablet-midwidth wrap (a "consider" in the backlog) is acceptable with the
current `flex-wrap`; revisit on the live authenticated surface.

**UPDATE (2026-06-06, shipped under D-055):** **PR [#6](https://github.com/F90Plus/f90/pull/6) MERGED** → `main` =
`dca4431` (merge commit; feature branch `chore/quality-hardening-pass` deleted local+remote; only `main`, tree
clean). **`vercel --prod`** → deployment **`dpl_EUUmCUnERCtQfft7BTf8MBXCBw27`** (READY, target production),
**aliased `https://www.f90.xyz`**; remote build green (Next 16.2.7, 23/23). **Prod-verified (HTTP):** landing `/`
→ 200 with the skip link live (`id="main-content"` + "Skip to content"/"Saltar al contenido" present) · `/home` ·
`/predictions` → 307 (auth gate) · `/u/[unknown]` → 404 · `/login?next=/settings` → 200 carrying
`/signup?next=%2Fsettings` (the `?next=` fix live). The auth-gated predict/standing/sign-out surfaces ship
dormant until the operator-gated loop goes live. Independent adversarial review pre-merge: SHIP.

### D-058 — Phase 2 loop audit: the PREDICT half is verified LIVE in prod; only `settle_fixture` (0005) confirmation + Resend SMTP remain ✅ (2026-06-06)
**Context:** the founder manually executed most of the Phase-2 operator runbook (Supabase shows `fixtures` 72 rows · `predictions` 11 rows · profiles/wallets/coin_ledger/countries; auth `site_url`=`https://www.f90.xyz` + redirect allow-list with `www.f90.xyz/**` + apex `f90.xyz/**` + localhost) and asked for a **fresh empirical audit** of what actually remains — not a runbook repeat. Audited the live system from outside.
**Findings (empirical, with evidence):**
- **Vercel env — ALL FOUR present** (`vercel env ls`, `chiribito293-7173s-projects/f90`): `SUPABASE_SECRET_KEY` (Preview+Prod, ~18h) · `ADMIN_SYNC_SECRET` (Prod, ~18h) · `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Preview+Prod, ~24h). **Corroborated independently:** `POST /api/admin/sync-fixtures` and `/api/admin/settle` (no secret) both return **401, not 503** → the routes' `if (!ADMIN_SYNC_SECRET) → 503` fail-closed guard is NOT hit ⇒ the secret IS set in prod. **No env var is missing.**
- **Migration 0004 (fixtures/predictions/`make_prediction`/`prediction_kind`) — APPLIED** (proven: 72 fixtures + 11 predictions written through `make_prediction`, the sole write path).
- **Migration 0006 (service_role grant on `fixtures`) — APPLIED** (proven: sync upserts 72 fixtures via the service_role admin client; without 0006's grant it returns 42501 "permission denied for table fixtures" — per the migration header, observed-and-fixed in prod).
- **Sync ran** (72 group-stage fixtures w/ probabilities) · **D-035 site_url + allow-list set** (founder) · **deploy done** (D-057). ⇒ **The predict → lock-at-kickoff → earn-on-correct loop is OPERATIONALLY LIVE in production now** (real users have made 11 predictions).
**The only two remaining items:**
1. **Confirm migration 0005 `settle_fixture(text)` is applied.** WHAT: the SECURITY DEFINER settlement RPC. WHY: `/api/admin/settle` calls `supabase.rpc('settle_fixture', …)` to award points/Tokens on finished matches; without it, settlement 500s. HOW I KNOW IT'S UNVERIFIED: it's service_role-only + SECURITY DEFINER (no external probe), and a pre-match settle returns early (`finished.length===0`) WITHOUT calling it, so even running settle now wouldn't exercise it. It is **almost certainly applied** (bracketed by the proven-applied 0004 below and 0006 above). BLOCKER CLASS: **hard blocker for SETTLEMENT** (activates with the first finished match — opener **11 Jun**); does **NOT** block predicting now. VERIFY (10s, SQL editor): `select to_regprocedure('public.settle_fixture(text)');` → non-null = applied.
2. **Resend SMTP for magic-link.** WHAT: a custom production SMTP for auth emails. WHY: Supabase's built-in email is rate-limited (~handful/hour, Supabase-branded) — fine for testing, not production scale. HOW I KNOW IT'S UNVERIFIED: it's a dashboard-only Auth→SMTP setting with no external probe. BLOCKER CLASS: **recommendation, not a blocker** — Google OAuth is already a complete sign-in path, and magic-link still works at low volume on the built-in sender. Required only if magic-link email is a production-scale launch channel.
**Consequences:** the Phase-2 operator runbook is **effectively complete**; the predict loop is **live**. The earlier "loop goes live after the runbook" wording (D-056/D-057/PHASE_2_HANDOFF) is **superseded** by this verified state. Settlement will run automatically once 0005 is confirmed and matches finish (operator hits `POST /api/admin/settle` post-matchday — the service key + admin secret are already in Vercel, so it can run against prod).
