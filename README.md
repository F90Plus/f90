# F90+ ⚽️

**The social, free-to-play way to predict the 2026 World Cup.**

F90+ turns every match of the World Cup into a moment: make your calls, earn
**virtual** coins, climb a **global leaderboard**, and out-predict your friends —
helped (or trolled) by a football-smart AI pundit.

> 🛑 **Not gambling.** F90+ uses virtual coins only. No deposits, no payouts, no
> real money. Ever. The only currency that's real is bragging rights.

---

## ✨ What's in this repo today

This is the **foundation** — visual identity, design system, i18n, and a
cinematic homepage. No backend, no auth, no live data yet (all of that is
scaffolded-for, not built — see [`docs/ROADMAP.md`](docs/ROADMAP.md)).

- 🌃 **Night-stadium visual identity** — broadcast overlays, soft LED glows, a
  premium sports feel. See [`docs/DESIGN_DIRECTION.md`](docs/DESIGN_DIRECTION.md).
- 🎨 **Token-driven design system** — Tailwind v4 with a CSS-first theme.
- 🌍 **Bilingual from day one (ES / EN)** — `next-intl`, locale routing, zero
  hardcoded copy.
- 🏟️ **A homepage that already feels like World Cup night** — animated hero,
  live countdown, broadcast match cards, leaderboard teaser.
- 🧱 **Clean, scalable monorepo** — ready to grow features without a rewrite.

## 🧰 Tech stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Framework    | **Next.js 16** (App Router, React Server Components) |
| Language     | **TypeScript** (strict)                             |
| Styling      | **Tailwind CSS v4** (CSS-first tokens)              |
| Motion       | **Framer Motion**                                   |
| i18n         | **next-intl** (ES / EN)                             |
| Fonts        | **Geist** (UI) · **Space Grotesk** (display)        |
| Tooling      | **pnpm** workspaces · ESLint · Prettier             |

## 🚀 Getting started

**Prerequisites:** Node ≥ 20.9 (Node 24 recommended — see `.nvmrc`).

```bash
# 1. Enable pnpm (bundled with Node via Corepack)
corepack enable

# 2. Install dependencies (from the repo root)
pnpm install

# 3. Start the dev server
pnpm dev
```

Open **http://localhost:3000** → you'll be routed to your browser's language
(`/` for Spanish, `/en` for English).

> No environment variables are required for the foundation. `apps/web/.env.example`
> documents the keys future integrations will use.

## 📜 Scripts (run from the repo root)

| Command            | Does                                          |
| ------------------ | --------------------------------------------- |
| `pnpm dev`         | Start the Next.js dev server                  |
| `pnpm build`       | Production build                              |
| `pnpm start`       | Serve the production build                    |
| `pnpm lint`        | ESLint                                        |
| `pnpm typecheck`   | TypeScript, no emit                           |
| `pnpm format`      | Prettier write                                |

## 🗂️ Project structure

```
f90plus/
├── apps/
│   └── web/                  # The Next.js application
│       ├── locales/          # Translation catalogs (es.json, en.json)
│       └── src/
│           ├── app/[locale]/ # Locale-scoped routes (App Router)
│           ├── components/    # Reusable UI (ui/) + layout shell (layout/)
│           ├── features/      # Feature-scoped UI (home/, then predictions/, …)
│           ├── data/          # Mock data (replaced by APIs later)
│           ├── i18n/          # next-intl routing/request/navigation
│           ├── lib/           # Framework-agnostic helpers (cn, motion, constants)
│           └── styles/        # globals.css — the design tokens live here
├── docs/                     # Vision, design, roadmap, architecture
└── packages/                 # (reserved) shared packages as the platform grows
```

A deeper tour lives in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## 🌍 Internationalization

Every user-facing string lives in `apps/web/locales/<locale>.json`. To add copy,
add the key to **both** catalogs and read it with `useTranslations('namespace')`.
To add a language, add it to `apps/web/src/i18n/routing.ts` and drop in a new
catalog — routing, middleware and the language switcher pick it up automatically.

## 📚 Documentation

| Doc                                              | What it covers                          |
| ------------------------------------------------ | --------------------------------------- |
| [AGENTS.md](AGENTS.md)                           | Onboarding for any AI/dev — **start here** |
| [PROJECT_STATE.md](docs/PROJECT_STATE.md)        | **Checkpoint** — current state, resume point |
| [PHASE_1_IDENTITY.md](docs/PHASE_1_IDENTITY.md)  | **Phase 1 spec** — Identity & Accounts (the build contract) |
| [SCHEMA_V1.md](docs/SCHEMA_V1.md)                | Supabase / Postgres schema contract (RLS + ledgers) |
| [PHASE_1_IMPLEMENTATION_PLAN.md](docs/PHASE_1_IMPLEMENTATION_PLAN.md) | Phase 1 ordered task plan + pre-flight |
| [VISUAL_DIRECTION.md](docs/VISUAL_DIRECTION.md)  | Art-direction north star + rules |
| [ASSETS_STATE.md](docs/ASSETS_STATE.md)          | Imagery inventory + treatment |
| [GLOBE_PHASE_PLAN.md](docs/GLOBE_PHASE_PLAN.md)  | The 3D World Cup Globe — phase plan |
| [NEXT_PHASES.md](docs/NEXT_PHASES.md)            | Ordered roadmap |
| [PROJECT_VISION.md](docs/PROJECT_VISION.md)      | What F90+ is, who it's for, principles  |
| [DESIGN_DIRECTION.md](docs/DESIGN_DIRECTION.md)  | Visual identity, tokens, motion, do/don't |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)          | Stack, structure, rendering, decisions  |
| [ROADMAP.md](docs/ROADMAP.md)                    | Phased plan from foundation to launch   |
| [AI_COPILOT_VISION.md](docs/AI_COPILOT_VISION.md) | The per-user football Analyst — vision  |
| [AI_COPILOT_ARCHITECTURE_V1.md](docs/AI_COPILOT_ARCHITECTURE_V1.md) | No-LLM copilot system design |
| [PREDICTION_ENGINE_V1.md](docs/PREDICTION_ENGINE_V1.md) | Signal/scoring engine (the math) |
| [DATA_SOURCES_RESEARCH.md](docs/DATA_SOURCES_RESEARCH.md) | Free football data + prediction APIs |
| [BRANDING_INTEGRATION.md](docs/BRANDING_INTEGRATION.md) | Logo integration plan + asset manifest |
| [BRAND_GUIDELINES.md](docs/BRAND_GUIDELINES.md) | Colors, logo usage, glow, typography |
| [ART_DIRECTION_ASSETS.md](docs/ART_DIRECTION_ASSETS.md) | Photo-first hero — how to add real cinematic imagery |
| [OPERATING_MODEL.md](docs/OPERATING_MODEL.md) | How F90+ is run (studio ownership) |
| [DECISIONS.md](docs/DECISIONS.md) | Decision log (ADR) |

---

<p align="center"><sub>Built for the love of the game. ⚽️</sub></p>
