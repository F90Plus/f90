# F90+ — Foundation Final (consolidation — CLOSED)

> **STATUS: ✅ FOUNDATION CLOSED (2026-06-03).** Extremely solid, clean, production-ready
> base — ready to stop with zero conceptual debt and resume from a mature state.
> The only remaining step is the **public launch** (founder, via
> [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md)).
> Vision: [PROJECT_VISION.md](PROJECT_VISION.md) · [EXPERIENCE_SYSTEM.md](EXPERIENCE_SYSTEM.md).
> Hero contract: [GLOBE_HERO_SPEC.md](GLOBE_HERO_SPEC.md).

## Scope (founder, 2026-06-03)
Connect `f90.xyz` · clean deploy · definitive real globe hero · metadata/SEO/social
cards · loading states · mobile parity · performance/fallback/reduced-motion · local
assets · general stability · total visual coherence · premium/global feel everywhere ·
cleanup · final docs · handoff/continuity for Phase 1. **Priority: stability · quality ·
cohesion over speed. No new systems.**

## Workstreams — all done ✅
1. ✅ **Assets vendored locally** (no runtime CDN) — Earth Night + topology + countries
   geojson → `apps/web/public/globe/` (NASA + Natural Earth, public domain).
2. ✅ **Real globe hero in the app** — built, wired, **typecheck + build green +
   browser-verified** (ES/EN · mobile · desktop · 0 console errors; globe renders with
   real data-driven states — gold hosts / green qualified; countdown **pedestal**).
   `lib/football/nations.ts` (states from real openfootball, honest hosts-only fallback) +
   `features/globe/` (`WorldCupGlobe` react-globe.gl/three, `GlobeMount` dynamic
   `ssr:false` + error boundary, `GlobeFallback`/`GlobeSkeleton`) + i18n.
3. ✅ **Mobile parity** — globe = living presence (contained); headline + globe own the
   first impact; CTA hinted below the fold (short scroll); safe areas (D-021).
4. ✅ **Performance / fallback / reduced-motion** — **DPR capped (≤1.6)**, **pause
   off-screen** (IntersectionObserver), **lazy-mount** (dynamic ssr:false),
   **reduced-motion** → static (no auto-rotate), **image fallback** via error boundary
   (never a broken canvas), assets vendored (no CDN).
5. ✅ **Metadata / SEO / social** — `metadataBase` → `https://f90.xyz` (env
   `NEXT_PUBLIC_APP_URL`), per-locale **canonical + hreflang**, OG + Twitter cards,
   `manifest`, **`robots.txt` + `sitemap.xml`** generated.
6. ✅ **Loading states** — globe lazy-load **skeleton**; homepage is ISR (no route
   Suspense needed, D-013); branded loader available for future async routes.
7. ✅ **Stability & coherence** — typecheck + production build **green**; verified ES/EN ·
   mobile · desktop, **0 console errors**; one cohesive night scene (globe in the stadium
   + countdown pedestal). *(Preview WebGL screenshots degrade after heavy use — restart
   the preview server to recover; not an app issue.)*
8. ✅ **Cleanup** — removed dead `BroadcastOverlay` + unused hero i18n keys
   (`featured`/`cardPrompt`/`cardHint`/`liveNow`, es+en). `MatchCard`/`StadiumScene` kept.
9. ✅ **Deploy-readiness + runbook** — env-driven, monorepo (root `apps/web`); exact
   steps in **[DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md)** (GitHub → isolated Vercel → envs →
   `f90.xyz` DNS → production + previews). The public step is the founder's.
10. ✅ **Final docs + handoff + clean state** — PROJECT_VISION + EXPERIENCE_SYSTEM
    canonized; PROJECT_STATE + ASSETS_STATE updated; DEPLOY_RUNBOOK written; this tracker
    is the handoff; **local commit** captures the closed foundation (no push).

## Deferred to the public-launch session (founder, with calm + full control)
- Create the official clean GitHub repo · connect the isolated Vercel project · connect
  `f90.xyz` · public deploy. → [DEPLOY_RUNBOOK.md](DEPLOY_RUNBOOK.md). Then start **Phase 1**.

## Done ✅
Vision canonized · definitive stable hero · metadata/SEO/social · performance/fallback/
reduced-motion · cleanup · docs + handoff · deploy-ready + runbook. **"The F90+
foundation is closed and ready to grow."**
