# F90+ — Phase 3 Candidates (captured during the Phase 2 Polish Pass)

> Findings from the Phase 2 Polish & Production Cohesion Pass (D-053) that require
> **new functionality / surfaces / systems** — deliberately **NOT implemented** in the
> polish pass (founder guardrail: "anything needing new functionality → Phase-3
> candidate, not implemented"). This is ordered input for when Phase 3 starts, not a
> commitment. Each item: what · why it's Phase-3 (not polish) · rough shape.

## Phase-3 candidates (need new functionality)

### C3-1 · Global navigation shell (sidebar / bottom-tab spine)
- **What:** a persistent app-shell nav for the authenticated experience (desktop
  sidebar / mobile bottom-tab), instead of header links + account menu.
- **Why Phase-3:** it's a structural surface. The polish pass made the existing
  header/menu nav correct and complete (every route reachable on mobile), which is
  the right interim. Already flagged deferred in **D-051**.
- **Shape:** a layout-level shell in `(app)/layout.tsx`; the surgical polish nav fixes
  are the bridge to it.

### C3-2 · Shared identity component (avatar + handle + country) across surfaces
- **What:** one reusable identity affordance used consistently in the standing strip,
  the account-menu disc, ranking rows, and the profile header.
- **Why Phase-3:** today the handle/avatar appears in 3 different visual treatments;
  unifying them is a small design-system build, not a one-line fix.
- **Shape:** `components/identity/*` consumed by all four surfaces.

### C3-3 · "Share my profile" affordance on `/u/[username]`
- **What:** an in-app share button (Web Share API + clipboard fallback) on the public
  profile, which already has a custom OG image built for sharing.
- **Why Phase-3:** new client island + i18n + edge-cases (self vs other) + analytics —
  a feature, not polish.
- **Shape:** a small client component on the profile; pairs with the growth loop.

### C3-4 · Settlement realtime reconciliation (see results without reloading)
- **What:** when a fixture settles while the user is on `/home` or `/predictions`,
  surface the result (points/Tokens) without a manual reload.
- **Why Phase-3:** needs a new data flow — Supabase Realtime on `predictions` (or a
  post-kickoff revalidate / polling strategy). Out of scope for a presentational pass.
- **Shape:** Realtime subscription filtered by `user_id`, or a "fresh results" banner.
- **Note:** this is the climax of the loop today discovered only via reload — high
  emotional value once the loop has real post-match traffic.

### C3-5 · Fixture-detail route + clickable prediction rows
- **What:** tapping a row in "Mis predicciones" / `/predictions` opens the fixture
  (re-examine the predict card; for active picks, change the pick from there).
- **Why Phase-3:** implies a new routable surface (`/fixtures/[id]` or similar) with
  its own queries, copy, and OG — a new surface, explicitly out of scope.
- **Shape:** a fixture-detail read-model + route; rows become links.

### C3-6 · Markets vocabulary + chip rework in `market-card`
- **What:** rename the internal `STAKES` constant (→ `ALLOCATIONS`/`CONVICTION_TIERS`)
  and rework the `+10/+50/+100 F90` chips so the lit "primary" chip doesn't read like a
  sportsbook stake button.
- **Why Phase-3:** the `market-card` lives in the Markets feature (landing preview, not
  a Phase-2 authenticated surface); touching its mental model belongs with the real
  markets engine. D-037 vocab law still applies to identifiers, so capture it here.
- **Shape:** rename + a chip restyle when the Markets phase lands.

### C3-7 · Free staking (choose any amount of Tokens per prediction) — needs brand ratification
- **What:** let a user put a variable amount of Tokens F90 on a prediction (vs the
  current free-to-predict, earn-on-correct model).
- **Why Phase-3 (and a brand call, not just a phase):** it's a **new economic mechanic**
  — variable amount → new columns/payout calc/balance deduction/settlement/anti-cheat =
  the Economy engine. It also changes the free-to-predict model (D-051), and "choose how
  much to risk" is the **core gesture of a sportsbook**, directly against **D-037**
  (probability-not-odds), the free/no-betting invariant, and the casino look F90+ avoids.
- **Status:** evaluated during the D-054 commitment pass and **deferred** — the desired
  "skin in the game" feeling was delivered instead via reputational levers (reward
  visible pre-pick, what's-at-stake = record/ranking, difficulty↔reward rule). If ever
  pursued, it requires **explicit founder ratification of a brand shift** + a dedicated
  Economy + responsible-play design. **Do not implement as polish.**

---

## Optional polish backlog (in-scope, deferred this pass)

> These are **in-scope** quality items the audit found but the founder's chosen
> Recommended set excluded (the "Fuller" tail). Not Phase-3 — they could land in a
> future small polish pass without new functionality. Listed so they're not lost.

- PredictCard mobile (<375px): long nation names truncate on the hero card — consider a
  stacked mobile layout or `sm`-only horizontal.
- Featured PredictCard width-step vs the grid below (`max-w-xl` hero vs `max-w-6xl` grid).
- Standing-strip flex-wrap at tablet midwidths (~640–900px) — consider an explicit grid.
- Globe key-art visibility tune (it sits at ~9% opacity, mostly off-viewport) — or swap
  to a stadium asset for the authenticated hub. *(HOM-004; a visual-direction call.)*
- "Settles soon" hint on locked-but-unsettled predictions (relative ETA).
- `aria-disabled` vs `disabled` during the in-flight window (focus retention nicety).
- Sign-out `useTransition` pending state (the form has no busy affordance).
- Settings: explicit on-page "← Inicio" + a dedicated sign-out card.
- Public profile: a CTA out for signed-out visitors arriving from a shared link.
- AuthPanel mode-switch: preserve `?next=` between `/login` and `/signup`.
- Extract an `<Eyebrow>` primitive (the `eyebrow` class is copied across routes).
- PredictCard entrance motion to match the landing cards (consistency; reduced-motion safe).

---

*Source: the Phase 2 Polish Pass audit (3 parallel static-audit subagents over the live
deployed product, 2026-06-05). Full decision record: [DECISIONS.md](DECISIONS.md) D-053.*
