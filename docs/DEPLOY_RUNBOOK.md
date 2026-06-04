# F90+ — Deploy Runbook (GitHub + Vercel + f90.xyz)

> The exact, step-by-step public-launch procedure. **STATUS: ✅ EXECUTED (2026-06-04) —
> live at https://f90.xyz** (GitHub `F90Plus/f90` → isolated Vercel root `apps/web` → DNS +
> SSL active). Kept as the reference + **rollback** runbook. **Domain: `f90.xyz`.**
> **Isolation:** F90+ uses its **own** GitHub repo and its **own** Vercel project /
> account — never shared with PMS / PT / Chiribito / XPrediction. Log into the F90+
> identity before any Vercel action.

---

## ⚠️ REALITY CHECK — how F90+ actually deploys (corrected 2026-06-04, D-033)

The auto-deploy assumptions further below (§4 "push to `main`", §6 "Production Branch: main →
serves f90.xyz") **do NOT match reality.** Verified on 2026-06-04 while publishing Phase 0.6:

- **No GitHub→Vercel auto-deploy.** The `f90` project is **not** git-connected for automatic
  deploys — pushing/merging to `main` triggers **nothing** (GitHub shows 0 deployments / 0 checks
  on the commits; the deployed production deployment has empty git metadata). **Production is
  published MANUALLY via `vercel --prod`.**
- **NOT an isolated Vercel account.** The `f90` project lives in the Vercel team
  **`chiribito293-7173s-projects`** — the **same team as Chiribito** (`chiribito-play`,
  `chiribito-web`), `xpredict`, `xprediction-demo`, etc. This **contradicts** the "isolated F90+
  Vercel account" claim in the intro / §2 / §6. *(Open governance item: migrate `f90` to a truly
  isolated F90+ Vercel team, or accept the shared team. Until decided, log into
  `chiribito293-7173` for any `f90` Vercel action.)*
- **Canonical domain is `www.f90.xyz`.** The apex `f90.xyz` **308-redirects to `www.f90.xyz`**
  (the intended "apex primary, www→apex" is reversed in practice).

### Manual production deploy — the ACTUAL procedure
From the repo root, with the working tree on the commit you want live (e.g. `main`):
```
vercel link --project f90 --yes --scope chiribito293-7173s-projects
vercel --prod --yes
```
Builds the **local working tree** on Vercel and, on success, aliases **`www.f90.xyz`** to the new
deployment. Verify: `https://www.f90.xyz/` (ES) and `https://www.f90.xyz/en` (EN) show the current
build; response header `x-vercel-cache: PRERENDER, age: 0` confirms a fresh deploy.
**Repeat after every phase** unless/until GitHub auto-deploy is connected.

### To switch to proper auto-deploy (optional, recommended)
Vercel → `f90` project → Settings → Git → **Connect Git Repository** → `F90Plus/f90`,
Production Branch = `main` (the Vercel GitHub App needs access to the `F90Plus` org). Then pushes
to `main` auto-deploy and the manual step above is no longer needed.

---

## 0. Prerequisites
- The local repo at `Documents\F90PLUS\f90plus` (git initialized; foundation committed).
- A GitHub account/org for F90+ and a Vercel account/team for F90+ (isolated).
- Access to the `f90.xyz` DNS (the registrar where it's registered).
- Node ≥ 20.9 (project uses Node 24 + pnpm via Corepack).

## 1. Official GitHub repo (clean)
1. On GitHub, **create a new empty repo** (e.g. `f90plus` — private is fine), **no**
   README/license/gitignore (the repo already has them).
2. From the local repo, add the remote and push `master` (or rename to `main`):
   ```bash
   cd Documents\F90PLUS\f90plus
   git branch -M main                       # optional: standardize on main
   git remote add origin https://github.com/<owner>/f90plus.git
   git push -u origin main
   ```
   `node_modules/`, `.next/`, `.env*` are already gitignored; `pnpm-lock.yaml` IS
   committed (Vercel needs it). The vendored globe assets in `apps/web/public/globe/`
   ARE committed (intended).

## 2. Vercel project (separate / isolated)
1. Log into the **F90+ Vercel account/team** (not PMS/PT/Chiribito/XPrediction).
2. **Add New → Project → Import** the `f90plus` GitHub repo.
3. Configure (monorepo — the app is in `apps/web`):
   - **Root Directory:** `apps/web`  ← important.
   - **Framework Preset:** Next.js (auto-detected).
   - **Build Command:** default (`next build`).
   - **Install Command:** default (Vercel detects **pnpm** from the lockfile).
   - **Node.js Version:** 20.x or later.
4. Don't deploy yet — set env vars first (next step), or deploy and redeploy after.

## 3. Environment variables (Vercel → Settings → Environment Variables)
Foundation needs only one:
| Key | Value | Environments |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | `https://f90.xyz` | **Production** |
| `NEXT_PUBLIC_APP_URL` | `https://<preview-url>` *(optional)* | Preview |

- Drives canonical URL, OG/Twitter cards, `sitemap.xml`, `robots.txt`.
- If unset, the code falls back to `https://f90.xyz` (so production is still correct),
  but setting it explicitly is cleaner.
- **Later (not now):** Supabase / football-data / AI keys — see
  [`apps/web/.env.example`](../apps/web/.env.example). None are required for the foundation.

## 4. First deploy
- Trigger the **Production** deploy (push to `main` or "Deploy" in the dashboard).
- **Preview deploys** happen automatically for every other branch / pull request — no
  config needed. Each PR gets its own URL.

## 5. Connect `f90.xyz`
1. Vercel → Project → **Settings → Domains → Add** `f90.xyz` (and `www.f90.xyz`).
2. Vercel shows the **exact DNS records** to set — **use what Vercel shows**; the
   standard values are:
   - **Apex `f90.xyz`:** `A` record → `76.76.21.21`
     *(or, if your registrar supports ALIAS/ANAME at the apex, point it to
     `cname.vercel-dns.com`).*
   - **`www.f90.xyz`:** `CNAME` → `cname.vercel-dns.com`
   - *(Alternative: delegate the whole domain to Vercel's nameservers — only if you want
     Vercel to manage all DNS.)*
3. At the **registrar's DNS panel** for `f90.xyz`, create those records.
4. Set the **apex (`f90.xyz`) as the primary** domain; redirect `www → f90.xyz` (Vercel
   offers this toggle).
5. Wait for verification + automatic **SSL** (usually minutes; can take up to ~24–48h for
   DNS propagation).

## 6. Production + Preview (final config)
- **Production Branch:** `main` → serves `https://f90.xyz`.
- **Preview:** every non-production branch / PR → auto preview URL (safe to share).
- Re-deploy once after setting `NEXT_PUBLIC_APP_URL` so metadata picks up the prod URL.

## 7. Post-deploy verification
- [ ] `https://f90.xyz` loads the hero (globe + countdown), ES at `/`, EN at `/en`.
- [ ] Globe renders (or the image fallback on no-WebGL) — never a broken canvas.
- [ ] `https://f90.xyz/robots.txt` and `/sitemap.xml` resolve with the prod URL.
- [ ] OG preview is correct (share to a chat / use a card validator).
- [ ] Mobile + desktop look premium; no console errors.
- [ ] SSL padlock present.

## 8. Rollback & notes
- Vercel keeps every deploy — **Instant Rollback** to a previous one from the dashboard.
- Keep F90+ **fully isolated** (its own repo, Vercel team, env, domain). Never link this
  project to another ecosystem's Vercel team.
- This runbook is the only manual/public step; everything else is already built, verified
  and committed.
