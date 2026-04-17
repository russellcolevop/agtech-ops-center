# Staging Playbook

## TL;DR

Staging is kept alive during **active hardening pushes** (multiple risky DB changes in a short window) and torn down during **steady-state** periods (mostly copy / UI / frontend-only changes). The free-tier cap is 2 projects per user and is shared with `Tidy Tails`, so while staging exists, Tidy Tails stays paused.

**As of 2026-04-17:** we are in a hardening push. Staging project `vczzowvmfcxiftdkahja` is live, Tidy Tails is paused. When the push ends (FK cascade fix + Edge Function for admin delete + any trailing RLS work), we delete staging and unpause Tidy Tails.

## When to bother with staging

**Stage it:**
- SQL migrations (new tables, columns, views)
- RLS policy changes
- Auth flow changes (sign-in / sign-up / magic link)
- Anything that could lose user data if it goes wrong
- Anything that touches `auth.users` foreign keys

**Skip staging — push direct to prod:**
- Copy / wording / typo fixes
- Image swaps, CSS tweaks, layout changes
- New static sections that don't touch Supabase
- Frontend-only logic changes that use existing queries unchanged

The middle ground (small JS that hits the DB but doesn't change its shape) is a judgment call. If you can explain in one sentence what changed and you're confident, push direct. Otherwise stage.

## How to spin up staging on demand (~10 min)

### 1. Free a project slot
- Go to <https://supabase.com/dashboard/projects>
- Pause `Tidy Tails` (Project Settings → General → Pause project)
- Confirm: you should now have 1 active project (Founder Ops Center prod)

### 2. Create the staging project
- Go to the org page: <https://supabase.com/dashboard/organizations>
- Click "New project"
- Name: `founder-ops-center-staging`
- Region: Americas (matches prod)
- Database password: click "Generate a password" — **save this** in 1Password / Keychain
- Security: leave both checkboxes at defaults (Enable Data API ✅, Enable automatic RLS ❌)
- Click "Create new project" — wait ~2 min

### 3. Copy schema from prod

For most single-migration tests, **don't bother with a full schema dump**. Instead, copy just the tables the upcoming migration touches — usually 20-100 lines of CREATE TABLE statements pasted into staging's SQL editor. Fast, no tooling required.

For a full structural clone of prod (worth doing once per hardening push, or when multiple migrations interact), use the Supabase CLI:

```bash
# One-time install (already done? skip)
brew install supabase/tap/supabase

# Get prod's connection string from:
# https://supabase.com/dashboard/project/odvwxgxhacotiuyjyqtk/settings/database
# Look for "Connection string" → "Direct connection" → copy the URI

# Dump prod schema (no data — just structure)
supabase db dump \
  --db-url "postgresql://postgres:[YOUR-PROD-DB-PASSWORD]@db.odvwxgxhacotiuyjyqtk.supabase.co:5432/postgres" \
  --schema public \
  > /tmp/prod-schema.sql

# Open the file, copy the contents, paste into staging's SQL editor:
# https://supabase.com/dashboard/project/[STAGING-REF]/sql/new
# Click Run.
```

If you don't want to install the CLI, the alternative is: in prod's SQL editor, run the schema-dump query manually (slow and error-prone — prefer the CLI route).

### 4. Wire `index.html` to staging
Open `index.html`, find the Supabase client initialization (search for `createClient`), and temporarily swap:
- `https://odvwxgxhacotiuyjyqtk.supabase.co` → `https://[STAGING-REF].supabase.co`
- The prod anon key → the staging anon key

**Critical:** do this on a `staging` git branch, not `main`. If you push `main` with the staging URL, the live site will start writing to staging.

### 5. Test your change

- Run the SQL migration against staging first
- Open `index.html` locally (`python3 -m http.server` from the repo root, then visit `http://localhost:8000`)
- Sign in, exercise the affected features, verify nothing broke
- If broken: fix the migration, drop the staging tables (`drop schema public cascade; create schema public;`), re-run

### 6. Promote to prod and tear down
- On the `main` branch, swap the URL/key back to prod
- Run the now-tested migration against prod's SQL editor
- Commit + push the migration file
- Delete the staging project: <https://supabase.com/dashboard/project/[STAGING-REF]/settings/general> → "Delete project"
- Unpause Tidy Tails

## Last staging project (for reference)

This is the staging project we created on 2026-04-17 and then tore down. If we ever need to resurrect it for some reason (unlikely — easier to spin a new one):

- Project ref: `vczzowvmfcxiftdkahja`
- URL: `https://vczzowvmfcxiftdkahja.supabase.co`
- Anon key: see git history of this file (was committed and then removed) or ask Russell
- Region: Americas
- Org: russellcolevop's Org (`uqrxpjnrodhjthdrnsro`)

The DB password was generated in-browser and saved separately by Russell.

## Pro-tier alternative

If we ever upgrade to Supabase Pro ($25/mo), staging becomes much easier:

- **Branching**: Pro projects can spin up branched copies of the database in 1 click
- **No project cap**: Pro orgs aren't limited to 2 projects per user
- **Point-in-time recovery**: prod gets restorable up to 7 days back

If we end up running risky migrations more than once a month, Pro pays for itself in saved setup time.
