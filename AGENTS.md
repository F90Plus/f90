# AGENTS.md — F90+

> Onboarding brief for **any** AI assistant or human developer. F90+ is built with
> 100% standard, portable tooling — **no dependency on any single AI or editor**.
> Claude, ChatGPT, Codex, Cursor, Windsurf, or a human team can all open this repo
> and continue it the same way. This file is plain Markdown (the open `AGENTS.md`
> convention) — no magic, no proprietary tooling.

## What F90+ is

A social, free-to-play prediction experience for the **2026 World Cup**. Virtual
coins, rankings, profiles, and a rule/stats-based football **Copilot** ("The
Analyst"). Not gambling, no real money. Product copy is **English**; the team
collaborates in Spanish. Read [README.md](README.md) for the overview.

## Golden rules (invariants — don't break without owner sign-off)

1. **Portable & tool-agnostic.** Standard Next.js/TypeScript/pnpm only. No code,
   config, or workflow tied to a specific AI/editor. Anyone can continue it.
2. **Total isolation** from other projects (no shared repos/infra/branding).
3. **Mobile-first**, **premium night-stadium / broadcast** feel (never casino).
4. **World Cup 2026 identity**, social-first, **free / virtual only** (no betting).
5. **i18n always** — no hardcoded user-facing copy (everything in `locales/`).
6. **Design tokens over hardcoding** (colors/spacing/motion live in the theme).
7. **No paid LLM / no paid data in V1** — intelligence is deterministic.

## Stack

Next.js 16 (App Router, RSC) · React 19 · TypeScript (strict) · Tailwind v4
(CSS-first tokens) · Framer Motion · next-intl (es/en) · pnpm workspaces.

## Run it (standard commands — works anywhere)

```bash
# Node ≥ 20.9 (Node 24 recommended). Enable pnpm if needed:
corepack enable           # or: npm i -g pnpm
pnpm install
pnpm dev                  # → http://localhost:3000
pnpm build && pnpm start  # production
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint
```

No environment variables are required to run. Optional integrations are documented
in `apps/web/.env.example`.

## Where things live

```
apps/web/src/
├── app/[locale]/        # routes (App Router); page.tsx fetches data + composes sections
├── components/          # ui/ (primitives) · layout/ · atmosphere/ (ambient)
├── features/            # home/ (hero, match cards…) · copilot/ (Analyst)
├── lib/
│   ├── football/        # REAL data: openfootball adapter, team meta, model, football-data (gated)
│   ├── copilot/         # deterministic prediction engine (model/sources/engine/insights)
│   ├── brand.ts         # brand asset manifest · utils.ts · motion.ts · constants.ts
├── data/matches.ts      # mock FALLBACK fixtures (used only if the real source fails)
├── i18n/                # next-intl routing/request/navigation
├── locales/{es,en}.json # all copy
└── styles/globals.css   # design tokens (@theme) + atmosphere helpers
scripts/brand/           # reproducible icon/OG generation (Python/Pillow)
docs/                    # full project documentation (read these)
```

## How to work on it

- **Data sources are swappable adapters** behind one interface (`lib/football`,
  `lib/copilot/sources`). They are **cache-first** and **degrade gracefully**
  (real source → mock fallback; never throws). Add/replace a provider by adding a
  file — nothing above the source layer changes.
- **The prediction engine is pure & deterministic** (`lib/copilot/engine`) — easy
  to test, no LLM. An LLM can be added later as a *narration* layer on top; it must
  never invent numbers.
- Keep components small and single-purpose. Server Components by default; add
  `'use client'` only at interactive leaves.
- **Record decisions** in [docs/DECISIONS.md](docs/DECISIONS.md). Update docs as you go.

## Read next (in order)

0. **[docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) — START HERE to resume** (current
   state, what's built, where to continue)
1. [README.md](README.md) — overview & quick start
2. [docs/OPERATING_MODEL.md](docs/OPERATING_MODEL.md) — how the project is run + Definition of Done
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — structure, rendering, decisions
4. [docs/DECISIONS.md](docs/DECISIONS.md) — the decision log (the *why*)
5. [docs/PROJECT_VISION.md](docs/PROJECT_VISION.md) · [docs/DESIGN_DIRECTION.md](docs/DESIGN_DIRECTION.md) · [docs/BRAND_GUIDELINES.md](docs/BRAND_GUIDELINES.md)
6. Copilot: [docs/AI_COPILOT_ARCHITECTURE_V1.md](docs/AI_COPILOT_ARCHITECTURE_V1.md) · [docs/PREDICTION_ENGINE_V1.md](docs/PREDICTION_ENGINE_V1.md) · [docs/DATA_SOURCES_RESEARCH.md](docs/DATA_SOURCES_RESEARCH.md)
7. [docs/ROADMAP.md](docs/ROADMAP.md) — what's next (reordered around the loop)
8. **Building Phase 1?** [docs/PHASE_1_IDENTITY.md](docs/PHASE_1_IDENTITY.md) (spec) ·
   [docs/SCHEMA_V1.md](docs/SCHEMA_V1.md) (DB contract) ·
   [docs/PHASE_1_IMPLEMENTATION_PLAN.md](docs/PHASE_1_IMPLEMENTATION_PLAN.md) (task map)

> If you're an AI or developer opening this fresh: this file + the docs above are
> everything you need. The project is standard and self-explanatory by design.
