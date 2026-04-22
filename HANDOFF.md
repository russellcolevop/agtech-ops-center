# Handoff — agtech-ops-center (FounderOps Center)

Single source of truth for "whose turn is it, and what are they doing?" on FounderOps Center.

> **Brand vs repo name**: the product is **FounderOps Center** (https://www.founderopscenter.com). The repo is named `agtech-ops-center` — historical, from the AIVA Network / AgTech ecosystem origin. Don't rename; the CNAME and Pages config are wired to this repo name.

## Current state

- **Whose turn**: Russell
- **Focus**: dev
- **Reason**: Mid-refactor from the old monolith into a Phase 1/2/3 split. Phase 1 extracted — `src/app.js` is ~16.1k lines of ES module logic, `index.html` is now a 428-line shell. Phase 2/3 still pending. Supabase RLS hardened 2026-04-18 (`supabase/migrations/20260418_fix_rls_gaps.sql` + `20260418_profiles_read_access.sql`). A couple of real users on the custom domain, low activity.
- **Updated**: 2026-04-21 (studio migration)
- **Updated by**: Cowork

## What just happened

- **Migrated into Russell Labs** (2026-04-21). Repo transferred from `russellcolevop/agtech-ops-center` → `russell-labs/agtech-ops-center`. Studio standard files (`HANDOFF.md`, `CLAUDE.md`) added at repo root. Registered in studio `PROJECTS.md` dashboard + detail section and in studio `README.md` Active ventures row. Local working directory at `~/Developer/founder-op-center/` had its origin remote re-pointed to the new URL (not fresh-cloned — the existing working tree stays intact).
- **Custom domain `www.founderopscenter.com`** survives the transfer because the `CNAME` file lives in the repo. Brief HTTPS certificate flake possible for ~1–2 minutes post-transfer; GitHub Pages reissues automatically. If the site 404s longer than that, check `Settings → Pages` in the new repo and re-confirm the source branch.

## What's next

Move venture-specific work (feature building, Supabase schema changes, user conversations) into the FounderOps Center Cowork project, not the studio one.

1. **Russell**: open a new Cowork project mounted at `~/Developer/founder-op-center/`. That's where the real work now happens.
2. **Russell (optional)**: clone into the VPS workspace (`/opt/russell-labs/workspaces/agtech-ops-center/`) so the Telegram bot can work with it headless. Motivation: FounderOps Center is the most load-bearing thing on the laptop — getting it onto the VPS closes the laptop-as-SPOF risk for this venture specifically.
3. **Russell**: continue the Phase 2/3 monolith split inside the per-venture Cowork project. Phase 2 targets are "extract feature clusters from `src/app.js` into their own ES modules" — pick the next cluster with the cleanest boundary.
4. **Russell**: decide whether the transactional-email Edge Function (currently wired to welcome emails + ecosystem-listing approvals) should also be wired to intros. Right now intros use a manual `mailto:` handoff.

## Open decisions

- Is it worth giving FounderOps Center a Drive folder today, or only once there's a file (research, screenshots, user interview notes) to put in it?
- Should the repo be renamed `founderops-center` to match the brand? Default answer: no — rename breaks the Pages URL pattern and offers no value. Keep the historical name.

## Blockers (external)

- None.

## Context a fresh agent needs

- **What this is**: FounderOps Center is an operating platform for ecosystem managers — helps connect founders, mentors, accelerators, partner ecosystems. Built as a live tool to run Russell's day job at [AIVA Network](https://www.aivanetwork.com) (AgTech ecosystem for investors and founders).
- **Stack**: Static HTML + vanilla JS on GitHub Pages (custom domain `www.founderopscenter.com`), Supabase backend (project `odvwxgxhacotiuyjyqtk`) — Postgres + Auth (Google OAuth + email magic link) + one Edge Function for transactional email (Resend under the hood). RLS on all tables.
- **File layout**: `index.html` (shell) → loads `data/*.js` (classic scripts: mentors, accelerators, partner_ecosystems) → then `src/app.js` (ES module, ~16.1k lines — the whole app).
- **Deployment**: push to `main` → GitHub Pages rebuilds. No CI, no build step.

## Recent handoff log

| When | From → To | Note |
|---|---|---|
| 2026-04-21 | Cowork → Russell | Migrated from `russellcolevop/agtech-ops-center` into the `russell-labs` org. Studio standard files added. Russell to open per-venture Cowork project and (optional) clone to VPS. |
