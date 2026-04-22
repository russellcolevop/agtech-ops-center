# CLAUDE.md — context for Claude sessions working in agtech-ops-center (FounderOps Center)

If you are a Claude session (Claude Code, Cowork, or the VPS bot) that has just been handed this repo, read this first.

## What this is

FounderOps Center — a web platform for ecosystem managers to operate their ecosystems: connecting founders with mentors, accelerators, and partner ecosystems. Russell built it to run his own day job as **ecosystem manager for AIVA Network** (https://www.aivanetwork.com), an AgTech ecosystem for investors and founders. The product brand is "FounderOps Center" and the live site is at https://www.founderopscenter.com. The repo is named `agtech-ops-center` — historical, from the AgTech lineage. Don't rename.

Russell is the design partner and the heaviest user. A couple of real external users have signed up; activity is currently low.

## Current state (as of 2026-04-21)

- **Stage**: Launched (live, with users)
- **Deployed**: https://www.founderopscenter.com (GitHub Pages, custom domain via `CNAME` in repo root, serves from root of `main`)
- **Recent work**: Phase 1 of monolith split complete — `src/app.js` is now a single ES module (~16.1k lines), `index.html` is a 428-line shell. Phase 2/3 (breaking `src/app.js` into feature modules) is the current dev focus. Supabase RLS hardened on 2026-04-18 with two migrations: `20260418_fix_rls_gaps.sql` and `20260418_profiles_read_access.sql`.

## Stack

- **Frontend**: hand-written HTML + vanilla JavaScript + CSS. No framework, no bundler, no build step. Served as static files from GitHub Pages.
  - `index.html` — shell (head, nav, modal containers, one `<script type="module">` tag)
  - `src/app.js` — the whole app, a single ES module
  - `data/*.js` — static data as classic scripts, loaded before the module (mentors, accelerators, partner_ecosystems, etc.)
  - `styles.css`
- **Backend**: Supabase, project ID `odvwxgxhacotiuyjyqtk`
  - Postgres for profiles, intros, venture submissions, workspaces, accelerator applications, etc.
  - Supabase Auth — Google OAuth + email magic link
  - Row Level Security on all tables; latest migrations in `supabase/migrations/`
  - One Edge Function for transactional email (Resend API under the hood). Currently wired to: welcome emails, ecosystem-listing approvals. Not wired to: intros (those use manual `mailto:` today).
- **Auth flow**: browser → Supabase Auth → redirects back to `/` → `onAuthStateChange('SIGNED_IN')` fires → `applyUser()` hydrates the profile client-side.

## How to be useful here

- **Deployment is push-to-main.** There is no CI, no build step. A push to `main` is a release. That means: don't push a half-broken working tree. Test in the browser first (GitHub Pages serves from root, so you can usually `python3 -m http.server` locally and hit `http://localhost:8000`).
- **Supabase schema changes go in `supabase/migrations/`.** Name the file `YYYYMMDD_<what_it_does>.sql`. Apply via the Supabase dashboard SQL editor or the Supabase CLI. Don't edit Postgres out-of-band — the migration history is the source of truth.
- **When editing `src/app.js`**, respect Phase 2/3 intent — if you're adding a new feature cluster, consider whether it belongs in its own module rather than growing the main one further.
- **Don't touch `CNAME`.** It's what keeps `www.founderopscenter.com` pointing at this repo. Removing it breaks the custom domain.
- **Secrets.** The Supabase anon key is fine in client JS (it's designed to be public). The service role key is NOT — it should never appear anywhere in the repo. The Edge Function's Resend API key lives in Supabase project env vars, not here.

## Where the non-code context lives

- Google Drive: `Russell Labs/01_Active_Projects/agtech-ops-center/` (to be created — see studio runbook).
- For venture-specific work (feature planning, user interviews, design), open a **FounderOps Center Cowork project** mounted at `~/Developer/founder-op-center/`. Don't mix venture threads with studio (`venture-ops`) threads.

## History

- **2026-04-21** — Migrated from `russellcolevop/agtech-ops-center` into the `russell-labs` org as part of the studio rollup. Origin remote re-pointed on the existing local clone at `~/Developer/founder-op-center/`. Domain + Pages config survived the transfer (CNAME is in-repo).
- **Earlier** — Pre-studio. Built by Russell over time as a live tool for his AIVA Network ecosystem work.
