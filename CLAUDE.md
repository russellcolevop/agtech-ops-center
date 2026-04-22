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

These are project-specific guardrails. Don't relax them without asking Russell.

1. **Russell is non-developer. Before any destructive SQL or file operation, explain what you're about to do and ask first.** "Destructive" includes: dropping a column, deleting rows, rewriting a file from scratch, reverting a commit, force-pushing. If in doubt, ask.
2. **Use surgical edits, not full-file replacements.** The two big files in this repo — `src/app.js` (~16.1k lines) and `index.html` (428 lines) — should be edited via find-and-replace on exact strings, never re-output wholesale. A "here's the new full file" output is almost always wrong and impossible to review.
3. **The leftover Next.js folder is NOT the source of truth.** Some old Next.js scaffolding lives in this repo from an abandoned migration attempt. Ignore it unless Russell explicitly tells you to touch it. The real app is the static HTML + `src/app.js` + Supabase.
4. **Small commits with descriptive messages.** Russell reviews everything before push. Don't bundle unrelated changes; don't write `WIP` or `fix stuff`.
5. **Deployment is push-to-main.** No CI, no build step. A push to `main` is a release. Don't push a half-broken working tree. Test locally first — `python3 -m http.server` from the repo root, then hit `http://localhost:8000`.
6. **Supabase schema changes go in `supabase/migrations/`.** Name the file `YYYYMMDD_<what_it_does>.sql`. Apply via the Supabase dashboard SQL editor or the Supabase CLI. Don't edit Postgres out-of-band — the migration history is the source of truth. Prefer SQL migrations over in-HTML schema assumptions.
7. **When extending `src/app.js`**, respect Phase 2/3 intent — if you're adding a new feature cluster, consider whether it belongs in its own module rather than growing the main one further.
8. **Don't touch `CNAME`.** It's what keeps `www.founderopscenter.com` pointing at this repo. Removing it breaks the custom domain.
9. **Secrets.** The Supabase anon key is fine in client JS (it's designed to be public). The service role key is NOT — it should never appear anywhere in the repo. The Edge Function's Resend API key lives in Supabase project env vars, not here.

## Where the non-code context lives

- Google Drive: `Russell Labs/01_Active_Projects/agtech-ops-center/` (to be created — see studio runbook).
- For venture-specific work (feature planning, user interviews, design), open a **FounderOps Center Cowork project** mounted at `~/Developer/founder-op-center/`. Don't mix venture threads with studio (`venture-ops`) threads.

## History

- **2026-04-21** — Migrated from `russellcolevop/agtech-ops-center` into the `russell-labs` org as part of the studio rollup. Origin remote re-pointed on the existing local clone at `~/Developer/founder-op-center/`. Domain + Pages config survived the transfer (CNAME is in-repo). Pre-existing project-specific guardrails (the "Guidance for assistants" rules) were briefly lost during the migration `cp` step and recovered into the "How to be useful here" section above.
- **Earlier** — Pre-studio. Built by Russell over time as a live tool for his AIVA Network ecosystem work.
