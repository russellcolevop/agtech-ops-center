# CLAUDE.md — Founder Ops Center

## What this project actually is

**The live site is a single-file HTML app at `index.html` in the repo root.** It is served by **GitHub Pages** at **https://www.founderopscenter.com** (the `CNAME` file maps the custom domain).

That one file (~1.4 MB, ~18,900 lines) contains:
- All HTML, CSS, and JavaScript for the site
- An embedded Supabase client for auth, data, and storage
- Google OAuth + email magic-link sign-in
- An admin area, profile editor, ecosystem workspace, mentors directory, market intel, etc.

**Edit `index.html` and push to `main` → the live site updates.** There is no build step.

## What this project is NOT

- **Not a Next.js app.** A Next.js experiment exists in `_archive/nextjs-experiment/` (scaffolded as an attempt to break up the monolith). It is **not deployed, not current, and not the source of truth.** Do not edit it expecting changes to appear on the live site.
- **Not a Vercel deployment.** The Vercel project, if any, is pointing at the abandoned Next.js app. The real site is on GitHub Pages.
- **Not compartmentalized.** There is no component library, no data layer, no server. Everything is inside `index.html`.

## Who the owner is

Russell Cole — russellcolevop@gmail.com. **Non-developer.** Explain before running commands, ask before doing anything destructive, go one step at a time, and never try to "regenerate" `index.html` from scratch — it will be lossy. Always edit in place.

## Local setup

- **Working directory:** `~/Developer/founder-op-center/`
- **GitHub repo:** https://github.com/russellcolevop/agtech-ops-center (branch: `main`)
- **To preview locally:** open `index.html` directly in a browser, or run `python3 -m http.server` and visit `http://localhost:8000`
- **To deploy:** commit changes to `index.html` (or assets) and push to `main`. GitHub Pages picks up the change within a minute or two.
- **No `npm install`, no build step, no dev server.** Any `package.json` or `node_modules` in the archive folder is for the abandoned Next.js experiment only.

## Stack

- **Frontend:** hand-written HTML + vanilla JavaScript + some inline CSS inside `index.html`. Uses Supabase JS SDK loaded from a CDN `<script>` tag.
- **Hosting:** GitHub Pages (static) from the repo root.
- **Backend:** Supabase project `odvwxgxhacotiuyjyqtk` (PostgreSQL, Auth, Storage).
  - URL: `https://odvwxgxhacotiuyjyqtk.supabase.co`
  - Uses the anon key (embedded in HTML). Row Level Security controls access.
- **Auth:** Supabase Auth — Google OAuth + email magic link. No NextAuth, no server session layer.

## Files that matter at the repo root

| File / folder | Purpose |
|---|---|
| `index.html` | **THE SITE.** All markup, styles, and client JS. Edit here. |
| `CNAME` | Maps `www.founderopscenter.com` to GitHub Pages. Do not delete. |
| `Russell.jpeg` | Profile image, referenced directly from the HTML. |
| `assets/` | Images used by the site (og-image, headshot). Referenced by the HTML. |
| `supabase/migrations/` | SQL migrations for the Supabase database. Still current, still useful. |
| `supabase/functions-backup/` | Backup of Supabase Edge Functions. |
| `docs/` | Project documentation. |
| `_archive/nextjs-experiment/` | Abandoned Next.js rewrite attempt. **Do not edit expecting changes to affect the live site.** |

## Common tasks

- **Update copy on the site** → edit `index.html`, commit, push. Done.
- **Add a new image** → drop it in `assets/`, reference it from `index.html`, commit, push.
- **Add a database column or table** → write a migration in `supabase/migrations/`, run it in the Supabase SQL editor, then update `index.html` to use the new field.
- **Admin actions that need a service-role key** (e.g., `auth.admin.deleteUser`) → build a Supabase Edge Function. These actions **cannot** run from the browser because the service-role key would leak. For now we avoid this by: (a) the admin "Delete" button does a soft-delete instead (wipe profile + block), and (b) true hard-deletes go through the Supabase SQL editor per `docs/admin-ops.md`.

## Known issues and tech debt

- **Admin "Delete" button is a soft delete, not a hard delete.** The `deleteUser()` function in `index.html` (around line 10142) wipes profile fields and sets `blocked: true, blocked_reason: 'DELETED_BY_ADMIN'`, but the `auth.users` row stays. That means the user can't sign in, but their email address is still taken. For a full hard delete (to re-register with the same email, or for a GDPR erase request), run the SQL in `docs/admin-ops.md`. An Edge Function could wrap this into a UI button if volume ever warrants it; not worth building until then.
- **No permanent staging environment.** Staging is maintained on-demand per `docs/staging-playbook.md`: spin up during hardening pushes, tear down during steady-state copy/UI work. Free-tier cap is 2 projects per user, shared with `Tidy Tails`.
- **The file is large.** 1.4 MB / ~18,900 lines. This makes diffs hard, merges risky, and tempts assistants to "rewrite" it (which loses fidelity). Edits should always be surgical — find and replace a specific block, never regenerate the whole file.
- **Content is mixed with code.** Copy, lists, and structured data live inline as JS arrays/objects. Extracting them to JSON files would make content edits safer and non-technical.

## Guidance for assistants

1. **Treat `index.html` as append-only / edit-in-place.** Never output a replacement file. Use targeted edits that find an exact string and replace it.
2. **Before any destructive SQL or file operation, explain what you're about to do and ask.** Russell is a non-developer.
3. **The Next.js folder is not the source of truth.** Ignore it unless explicitly told otherwise.
4. **Prefer SQL migrations over in-HTML schema changes.** The HTML queries Supabase; the schema lives in Supabase.
5. **Small commits, descriptive messages.** Russell reviews everything before push.
