# F90+ — Operating Model

How F90+ is run. The founder sets **vision and priorities**; the build is owned and
operated end-to-end as an internal studio — organization, architecture, technical
direction, planning, coordination, documentation, consistency and product
decisions. The founder should not have to organize the project manually.

## Ownership principle

> The studio takes initiative, proposes improvements, catches problems *before*
> they're built, keeps the whole product coherent, documents as it goes, and always
> builds for the long term. The founder approves direction and unblocks the few
> decisions that are genuinely theirs.

## Internal disciplines (lenses, not personas)

Every change is considered through these responsibilities. They are *hats worn by
one coherent operator*, not separate characters.

| Discipline | Owns |
| --- | --- |
| **CEO** | Vision alignment, priorities, what we build next and why |
| **Product Lead** | Roadmap, features, user flows, scope discipline (YAGNI) |
| **CTO** | Stack, architecture, scalability, technical risk |
| **Systems Architect** | Module/feature organization, boundaries, naming |
| **Lead Engineer** | Clean implementation, tests, build health |
| **AI Lead** | Copilot, signal/prediction engine, data sources |
| **Creative Director** | Branding, atmosphere, the premium World Cup feeling |
| **Design Lead** | Design system, visual consistency, tokens, accessibility |

## Standing invariants (never violated without explicit founder sign-off)

1. **Total isolation** from other ecosystems (PMS / PT / Chiribito / XPrediction) —
   no shared repos, infra, branding, code or accounts.
2. **Mobile-first**, always.
3. **Premium football atmosphere** — night stadium / broadcast, never casino.
4. **World Cup 2026 identity** front and center.
5. **Social-first**.
6. **Free** — no real money, no betting, no pay-to-win. Virtual coins only.
7. **Clean, scalable, very visual, very alive.**
8. **English product, Spanish collaboration.** No hardcoded copy (i18n always).
9. **No paid LLM / no paid data in V1.** Intelligence comes from combining real
   data well, deterministically.
10. **Tokens over hardcoding** (color/spacing/motion live in the design system).
11. **Tool-agnostic & portable** — standard tech and conventions only; no lock-in to
    any AI or editor. Any AI/human can open and continue F90+. See
    [AGENTS.md](../AGENTS.md) and [DECISIONS.md](DECISIONS.md) D-016.

## How decisions get made

- **Default and proceed.** For reversible, conventional choices, pick the best
  option, record it in [DECISIONS.md](DECISIONS.md), and move on.
- **Flag before building.** If something looks wrong, risky, or incoherent, surface
  it *before* implementing.
- **Escalate only what's truly the founder's:** product vision, priorities, spend,
  brand identity shifts, and irreversible/outward-facing actions (publishing,
  deploying, creating public repos).
- **Coherence check** on every change: does it fit the invariants and the existing
  patterns?

## Definition of Done (quality gate for any change)

A change is "done" only when:

- [ ] `pnpm typecheck` clean (strict TS).
- [ ] `pnpm build` green — no errors, no `ignore*Errors` shortcuts.
- [ ] Verified in the browser: **ES + EN + mobile**, zero console errors.
- [ ] **No hardcoded user-facing copy** (everything via `locales/`).
- [ ] **No hardcoded design values** (uses tokens).
- [ ] Coherent with the design system and architecture.
- [ ] Docs updated (this folder) + [DECISIONS.md](DECISIONS.md) if a decision was made.

## Cadence

Work proceeds in **phases**. Each phase: *plan → build cleanly → verify in browser →
document*. [ROADMAP.md](ROADMAP.md) tracks where we are;
[DECISIONS.md](DECISIONS.md) records why.

## Documentation map

| Area | Doc |
| --- | --- |
| Product vision | [PROJECT_VISION.md](PROJECT_VISION.md) |
| Visual direction | [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) · [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md) |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Roadmap | [ROADMAP.md](ROADMAP.md) |
| Copilot | [AI_COPILOT_VISION.md](AI_COPILOT_VISION.md) · [AI_COPILOT_ARCHITECTURE_V1.md](AI_COPILOT_ARCHITECTURE_V1.md) · [PREDICTION_ENGINE_V1.md](PREDICTION_ENGINE_V1.md) |
| Data | [DATA_SOURCES_RESEARCH.md](DATA_SOURCES_RESEARCH.md) |
| Branding | [BRANDING_INTEGRATION.md](BRANDING_INTEGRATION.md) · [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md) |
| How we operate | **OPERATING_MODEL.md** (this) · [DECISIONS.md](DECISIONS.md) |

## Long-term posture

Every choice is made so the product can **grow** without a rewrite: typed
boundaries, swappable adapters, tokenized design, isolated features, and an
intelligence layer that accepts a real ML model or LLM later without touching the
honest deterministic core.
