# F90+ — Architecture

How the codebase is organized and why. Optimized for a small team to move fast
without painting itself into a corner.

## Principles

1. **Foundation, honestly.** No backend/auth/AI is faked. Where a real service
   will go, there's a clean seam (mock data, env placeholders) — not a stub
   pretending to work.
2. **Tokens over hardcoding.** Visual values live in one place (`globals.css`),
   copy lives in `locales/`. Components reference, never inline.
3. **Server-first, client where it earns it.** Default to React Server
   Components; opt into `'use client'` only for interactivity/animation.
4. **Feature-scoped, not type-scoped.** UI for a feature lives together under
   `features/<feature>/`; only truly shared primitives go in `components/`.
5. **Scalable, not over-built.** A pnpm monorepo with one app today, room for
   `packages/` and more apps tomorrow — without a Turborepo/microservice tax now.

## Stack

| Concern   | Choice                | Notes                                        |
| --------- | --------------------- | -------------------------------------------- |
| Framework | Next.js 16 App Router | RSC, file-system routing, server actions later |
| Language  | TypeScript (strict)   | `noUncheckedIndexedAccess` on                |
| Styling   | Tailwind CSS v4       | CSS-first `@theme`; no `tailwind.config.js`  |
| Motion    | Framer Motion         | Shared variants in `lib/motion.ts`           |
| i18n      | next-intl             | Locale routing + middleware + typed messages |
| Fonts     | Geist + Space Grotesk | via `geist` pkg + `next/font/google`         |
| Variants  | CVA + tailwind-merge  | `Button`/`Badge` variant API; `cn()` helper  |
| Pkg mgr   | pnpm workspaces       | root scripts proxy to `apps/web`             |

## Repository layout

```
f90plus/
├── apps/web/                       # The application (only app for now)
│   ├── locales/{es,en}.json        # Translation catalogs
│   └── src/
│       ├── app/
│       │   └── [locale]/           # Every route is locale-scoped
│       │       ├── layout.tsx      # Root <html>: fonts, providers, header/footer
│       │       ├── page.tsx        # Homepage composition
│       │       ├── not-found.tsx   # Localized 404
│       │       └── [...rest]/      # Catch-all → localized 404
│       ├── components/
│       │   ├── ui/                 # Primitives: Button, Badge, Card, Container…
│       │   └── layout/             # Header, Footer, Logo, LocaleSwitcher
│       ├── features/
│       │   └── home/               # Homepage sections (Hero, MatchCard, …)
│       ├── data/                   # Mock matches + leaderboard (→ APIs later)
│       ├── i18n/                   # routing.ts, request.ts, navigation.ts
│       ├── lib/                    # cn(), motion variants, constants
│       ├── styles/globals.css      # 🎨 Design tokens + base + helpers
│       └── middleware.ts           # next-intl locale negotiation
├── docs/                           # This documentation
└── packages/                       # (reserved) shared libraries as we grow
```

## Rendering model

- **Server Components by default** — layout, page, header, footer,
  section headings: no client JS shipped.
- **Client islands** (`'use client'`) only where needed: the locale switcher,
  the live countdown, and the animated home sections (Framer Motion +
  `whileInView`). Each island is small and self-contained.
- **Static generation per locale** via `generateStaticParams` +
  `setRequestLocale`, so localized pages can be statically rendered.

## Internationalization architecture

```
Request → middleware (negotiate locale, prefix routing)
        → app/[locale]/layout.tsx (setRequestLocale, NextIntlClientProvider)
        → i18n/request.ts (load locales/<locale>.json)
        → components read copy via useTranslations(namespace)
```

- **`i18n/routing.ts`** is the single source of truth for supported locales
  (`es`, `en`), the default (`es`), and the prefix strategy (`as-needed` → `/`
  for Spanish, `/en` for English).
- **`i18n/navigation.ts`** exports locale-aware `Link`/`useRouter`/`usePathname`.
  Always import navigation from here, never `next/navigation`.
- **Messages** are namespaced by section (`hero`, `matches`, …). ICU syntax is
  used for interpolation/number formatting (e.g. `{points, number} pts`).
- **Adding a locale** = one entry in `routing.ts` + one catalog file. Nothing
  else changes.

## Design-system architecture

- All design decisions are **tokens** in `globals.css` `@theme` (colors, fonts,
  radii, animation timings). Tailwind v4 generates utilities from them.
- **Component helpers** (`.glass`, `.hairline`, glows, `.eyebrow`, `.nums`,
  `.pitch-lines`, `.grain`) live in the same file's `@layer components` so the
  visual language is readable in one place.
- **Variants** are typed with `class-variance-authority` (`Button`, `Badge`);
  `cn()` (clsx + tailwind-merge) resolves conflicts.

## Data layer (today → tomorrow)

- **Today:** typed mock data in `src/data/` (`matches.ts`, `leaderboard.ts`)
  with explicit interfaces. Components consume the interfaces, not the source —
  so swapping in a real fetch is a localized change.
- **Tomorrow:** those modules become the boundary where Supabase / a football
  API / the AI engine plug in. Env placeholders are documented in
  `apps/web/.env.example`.

## Key decisions & rationale

| Decision | Why |
| -------- | --- |
| pnpm **monorepo** with a single `apps/web` | Matches the requested `apps/` shape and leaves room to grow (packages, admin app) without restructuring later. |
| **Tailwind v4 CSS-first** (no JS config) | The design system *is* the stylesheet — tokens and helpers in one readable place. |
| **next-intl** over a hand-rolled dictionary | Locale routing, formatting and SSR are solved problems; we get them for free and scale to more languages cleanly. |
| **3-letter codes + color tokens** for teams (no flag emoji) | Flag emoji render inconsistently (notably on Windows); broadcast-style codes + tinted tokens look premium everywhere and avoid shipping image assets in the foundation. |
| **Mock data with real interfaces** | Lets the homepage feel complete while keeping the integration seam obvious and honest. |
| **No `ignoreBuildErrors` shortcuts** | Builds stay truthful from day one. |

## Conventions

- Components: one component per file, kebab-case filenames, named exports.
- `'use client'` only at the leaves that need it; keep it off shared primitives
  where possible (`Card`, `Badge`, `Container`, `LiveDot` are server-safe).
- Import shared code via the `@/` alias (`@/components`, `@/lib`, `@/i18n`).
- Never hardcode user-facing text — add it to `locales/` and translate both.
