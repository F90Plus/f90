# F90+ — Design Direction

The north star: **a night at the stadium, shot like a broadcast.** Premium,
sporty, alive — never a casino, never a generic dashboard.

## Mood board (in words)

- 🌃 **Dark stadium atmosphere** — deep night-blue surfaces, floodlit highlights.
- 📺 **Broadcast overlays** — lower-third labels, live tags, score-graphic energy.
- 💡 **Soft LEDs** — glows that suggest stadium lights and big-screen panels.
- ⚽️ **Pitch under lights** — a green that reads as grass, used sparingly.
- 🍺 **World Cup bar warmth** — gold accents for the celebratory, communal feel.
- 🎬 **Cinematic & tactile** — motion with weight; everything feels touchable.

### Anti-patterns (do **not** do)

- ❌ Aggressive casino styling — neon overload, slot-machine energy, garish reds.
- ❌ Sportsbook clichés — odds-as-payouts framing, dense betting-slip UI.
- ❌ Generic Bootstrap/admin-dashboard look.
- ❌ Flat, lifeless layouts with no atmosphere or depth.

## Color system

Tokens live in [`apps/web/src/styles/globals.css`](../apps/web/src/styles/globals.css)
under `@theme`. Tailwind turns each into utilities (`bg-night-900`, `text-led-500`…).

| Role                  | Token family | Use                                              |
| --------------------- | ------------ | ------------------------------------------------ |
| **Night / surfaces**  | `night-*`    | Page background, cards, raised panels            |
| **Mist / text**       | `mist-*`     | Cool-white text from high to low emphasis        |
| **LED blue** (signature) | `led-*`   | Primary actions, brand highlights, links         |
| **Volt cyan**         | `volt-*`     | Glow partner, secondary data accents             |
| **Pitch green**       | `pitch-*`    | The grass — success, "free", used sparingly      |
| **Gold**              | `gold-*`     | Floodlight warmth, trophy/top-rank moments       |
| **Flare red**         | `flare-*`    | Live indicators and alerts only                  |

**LED blue is the signature color** — it's what makes F90+ recognizable and
keeps us clearly distinct from a green-felt casino look. Green is a supporting
accent, not the lead.

## Typography

- **Display / headlines → Space Grotesk.** Geometric, confident, sporty. Used
  for `h1`–`h3`, big numerals, and tracked uppercase broadcast labels.
- **UI / body → Geist Sans.** Clean, premium, highly legible.
- **Numerals → tabular.** Scores, points and the countdown use the `.nums`
  helper (`font-variant-numeric: tabular-nums`) so digits don't jitter.
- **Broadcast eyebrow** → the `.eyebrow` class: small, uppercase, wide tracking,
  LED-blue. The product's signature label style.

## Motion

Framer Motion, with a shared vocabulary in
[`apps/web/src/lib/motion.ts`](../apps/web/src/lib/motion.ts):

- **One easing curve** (`[0.16, 1, 0.3, 1]`, a confident ease-out) everywhere.
- **Entrances:** `fadeUp` + staggered children; sections animate in on scroll
  (`whileInView`, once).
- **Ambient life:** slow glow drift, a gentle float on the featured card, a
  live-pulse dot.
- **Tactility:** hover lift + spring on interactive cards and buttons.
- ♿️ **Always honor `prefers-reduced-motion`** — globals.css neutralizes
  animation for users who ask for less.

## Components & surfaces

- **`Card` / `.glass`** — the frosted broadcast panel with a lit top edge
  (`.hairline`). The default container for overlay-style content.
- **Glows** — `.glow-led` / `.glow-pitch` / `.glow-gold` for elevated emphasis.
- **`.text-gradient`** — the LED→volt headline highlight.
- **Match card** — the hero unit: matchup, live probabilities, predict CTA.
  Reused as a featured spotlight and in the fixtures grid.

## Layout

- **Mobile-first**, fluid up to a `max-w-6xl` (72rem) content column.
- Generous vertical rhythm (`py-16` → `py-24`) so sections breathe like
  broadcast segments.
- Sticky, blurred header that feels like an on-screen banner.

## Accessibility

- Color choices target legible contrast on the dark base; never rely on color
  alone (live state pairs the pulse dot with a text label).
- Visible focus rings (LED blue) on all interactive elements.
- Probability bars expose an `aria-label` describing the split.
- Reduced-motion fully supported.

## How to extend the system

1. Need a new color/size/animation? **Add a token** in `globals.css` `@theme` —
   don't hardcode hex values in components.
2. Need a new primitive? Put it in `components/ui/` and drive variants with
   `class-variance-authority`, like `Button` and `Badge`.
3. Keep feature-specific composition in `features/<feature>/`.
