# F90+ — Data Sources Research

> Research only. Nothing here is connected or implemented yet. Free tiers,
> pricing and World Cup coverage **drift over time** — re-verify every figure at
> integration time. Verified: **June 2026**.

The goal: power the F90+ AI Copilot with **real, current football data** at **$0**
for V1, with a clean upgrade path if budget appears later.

## TL;DR — the recommended free stack

| Need | Primary free source | Why |
| --- | --- | --- |
| WC2026 schedule, groups, teams, venues | **openfootball/worldcup.json** | Public domain, **no API key**, full 2026 bracket |
| Fixtures, results, standings (WC + top leagues) | **football-data.org** (free) | Free *forever*, clean JSON, World Cup included |
| Team/match stats, H2H, form, lineups, injuries, **predictions**, **odds** | **API-Football** (free) | One key unlocks everything; full WC2026 coverage |
| Market-implied probabilities ("consensus") | **The Odds API** (free) | 500 credits/mo, de-vig → fair probabilities |
| Crests, team images, colors | **TheSportsDB** (free) | Logos/branding metadata, 600+ leagues |
| **Community consensus** | **F90+ first-party** (our own users' picks) | Free, unique, grows with the platform |
| Historical data for model training/backtesting | **Football-Data.co.uk** + **StatsBomb Open Data** | Free CSV/JSON archives incl. historical odds |

**Architecture consequence:** every free tier is rate-limited, so F90+ must be
**cache-first** — scheduled jobs pull into our own DB; the app and copilot read
from us, never call third parties per user request. See
[AI_COPILOT_ARCHITECTURE_V1.md](AI_COPILOT_ARCHITECTURE_V1.md).

---

## Core data APIs (live/current data)

### 1. football-data.org — the free backbone ⭐
- **Cost:** Free tier, **free forever** for its core competitions (no trial clock).
- **Limits:** ~**10 requests/min** (authenticated free); 100/day unauthenticated.
- **Coverage:** 12 competitions incl. **FIFA World Cup**, Euro, Champions League,
  Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Eredivisie, Primeira
  Liga, Championship, Brazilian Série A.
- **Provides:** fixtures, results, standings, scorers; clean REST JSON; excellent docs.
- **Limitations:** scores are **delayed** on free (not true real-time); history
  limited to the **current season**; **no lineups / cards / substitutions / player
  data** on free or Basic plans.
- **Best for:** the reliable spine — schedule, results and standings for the World
  Cup and major leagues.

### 2. API-Football (api-sports.io / RapidAPI) — the rich one ⭐
- **Cost:** **Free plan, no credit card, always free.**
- **Limit:** **100 requests/day** (resets 00:00 UTC; unused requests are lost).
- **Endpoints on the FREE plan:** *all of them* — fixtures, livescore, **head-to-head**,
  events, **lineups**, **statistics**, standings, players, **injuries**, **pre-match
  odds**, in-play odds, and **predictions**. Free plans are limited only in the
  number of historical seasons, not in which endpoints you can call.
- **WC2026:** full coverage at `league=1&season=2026` — all 104 matches, schedule,
  standings, bracket, events, lineups, fixture & player stats, top scorers, injuries,
  **predictions**, **odds**.
- **Caveat:** **predictions coverage varies by competition** — check the
  `coverage.predictions` flag in the `/leagues` response before relying on it.
- **Limitations:** 100/day is the real constraint → mandatory hard caching; live
  data also counts against the quota.
- **Paid:** from ~$19/mo (more seasons, higher limits) — clean upgrade path.
- **Best for:** the copilot's analytical fuel — stats, H2H, form, predictions, odds —
  all from a single key.

### 3. The Odds API — market "consensus" ⭐
- **Cost:** **Free tier = 500 credits/month** (no credit card noted), all sports,
  most bookmakers, **all betting markets** (incl. h2h/moneyline and outrights).
- **Coverage:** soccer leagues + a dedicated **FIFA World Cup** odds feed.
- **Why it matters:** bookmaker odds, once **de-vigged** (overround removed), are
  the single best external probability estimate available for free — the true
  "market consensus." Credits scale with markets × regions, so request narrowly.
- **Best for:** the external "consensus" signal (used as *information*, never as
  betting advice — F90+ is virtual-only).

### 4. TheSportsDB — media & metadata
- **Cost:** Free (Patreon key raises limits); ~**30 req/min**.
- **Coverage:** 600+ soccer leagues, **crowd-sourced**.
- **Provides:** team crests, jerseys, stadium images, colors, basic metadata.
- **Limitations:** community-edited → accuracy varies; not for stat-critical use.
- **Best for:** logos/images/colors to make match cards and the copilot UI rich.

### 5. openfootball/worldcup.json — zero-auth WC2026 ⭐
- **Cost:** **Public domain, no API key, no restrictions whatsoever.**
- **Provides:** the full **2026** tournament as JSON — 48 teams, 12 groups, match
  schedule (round, date, time, teams, group, venue). Raw file:
  `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`
- **Limitations:** static (community-maintained); no live scores or stats; results
  appear post-hoc.
- **Best for:** the tournament skeleton (bracket/schedule/groups) with **zero**
  integration friction — perfect to seed F90+'s own database.

---

## Prediction / tipster / consensus sources

**Honest headline finding:** there is **no robust, free, official API for "tipster
consensus" or "community predictions."** The popular prediction sites
(Forebet ~52–58% model accuracy, OddsFlow, SoccerVista, Golsinyali) are **websites,
not clean APIs** — using them means scraping, which is fragile and usually against
their terms.

So F90+ gets "consensus" three legitimate, free ways instead:

| Source | What it is | Free? | Use |
| --- | --- | --- | --- |
| **Bookmaker odds** (The Odds API / API-Football `/odds`) | Market-implied probability after de-vig | ✅ | The strongest external "consensus" signal |
| **API-Football `/predictions`** | API-Sports' own model (winner, over/under, advice) | ✅ (coverage varies) | A second external opinion |
| **F90+ community consensus** | % of *our* users picking each outcome | ✅ (first-party) | Unique, compounding "wisdom of the crowd" |
| RapidAPI "Football Prediction" (boggio-analytics), Predicd | Third-party model APIs | Freemium (small free tier) | Optional extra opinion; evaluate later |

The F90+ community consensus is the interesting one: because the platform already
collects every user's prediction, we own a "wisdom of the crowd" signal for free
that no external API can sell us — and it gets better as we grow.

---

## Historical data (for model R&D, not live)

- **Football-Data.co.uk** — free historical results CSVs **including closing odds**
  for many leagues. Ideal for **backtesting** the prediction engine and calibrating
  weights. (Mostly club leagues, not international tournaments.)
- **StatsBomb Open Data** (GitHub, free JSON) — event-level data for *selected*
  competitions, for research/education; **attribution required**. Note: the free
  open data **does not include xG values**, and it won't contain WC2026. Use for
  building/validating models, not live coverage.
- **FBref / Sports-Reference** — historically the free home of xG/xA, but free
  programmatic access has been **restricted / discouraged**. Do **not** build a
  dependency on scraping it.

---

## Limitations & risks (read before designing)

1. **Rate limits are the binding constraint.** API-Football free = 100 req/day;
   football-data = 10 req/min. → F90+ **must** cache server-side and fetch on a
   schedule. Never call a third party from a user request.
2. **Real-time is not free.** football-data scores are delayed; true sub-15s live
   scores and live xG are paid (e.g. Sportmonks €78/mo+). V1 ships with
   near-real-time/polled data and is honest about it.
3. **No free real-time xG.** V1 uses a **goals-based xG proxy**; real xG is a paid
   upgrade later.
4. **Predictions coverage is uneven.** Treat external predictions as optional
   signals that degrade gracefully when absent.
5. **Crowd-sourced accuracy varies** (TheSportsDB). Keep it to media/metadata.
6. **Terms of service.** Respect each API's ToS and attribution (StatsBomb logo +
   credit). Don't scrape sites that don't offer an API.
7. **Drift.** Free tiers, prices and coverage change. Re-verify at integration.

## Recommended posture for V1

Use **football-data.org + API-Football (free) + The Odds API (free) + openfootball
+ TheSportsDB**, all behind a **cache-first ingestion layer**, complemented by
**F90+'s own community consensus**. This is a complete, $0, World-Cup-ready data
foundation. Paid tiers (API-Football $19/mo, Sportmonks for xG) are the obvious
later upgrades if/when there's budget.

---

## Sources

- [football-data.org — Pricing](https://www.football-data.org/pricing) · [API policies](https://docs.football-data.org/general/v4/policies.html)
- [Best Free Football APIs in 2026 — TheStatsAPI](https://www.thestatsapi.com/blog/free-football-api-alternatives)
- [API-Football — Pricing](https://www.api-football.com/pricing) · [Getting started guide](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide) · [FIFA World Cup 2026 guide](https://www.api-football.com/news/post/fifa-world-cup-2026-guide-to-using-data-with-api-sports)
- [The Odds API](https://the-odds-api.com/) · [FIFA World Cup odds](https://the-odds-api.com/sports/fifa-world-cup-odds.html)
- [TheSportsDB — Free Sports API](https://www.thesportsdb.com/free_sports_api)
- [Sportmonks — Free plan](https://www.sportmonks.com/football-api/free-plan/) · [World Cup 2026 API guide](https://www.sportmonks.com/blogs/world-cup-2026-api-guide-coverage-endpoints-data-types/)
- [openfootball/worldcup.json (GitHub)](https://github.com/openfootball/worldcup.json) · [2026 data](https://github.com/openfootball/worldcup.json/tree/master/2026)
- [StatsBomb Open Data (GitHub)](https://github.com/statsbomb/open-data) · [Where to get free football data — McKay Johns](https://mckayjohns.substack.com/p/where-to-get-free-football-data)
- [Forebet](https://www.forebet.com/en/football-tips-and-predictions-for-today) · [RapidAPI Football Prediction (boggio-analytics)](https://rapidapi.com/boggio-analytics/api/football-prediction) · [Predicd](https://www.predicd.com/en/predicd-api/)
