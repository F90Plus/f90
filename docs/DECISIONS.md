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
