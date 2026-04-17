# Admin Operations

Operations that require direct database access, outside the admin UI. All commands below run in the Supabase SQL editor at:

<https://supabase.com/dashboard/project/odvwxgxhacotiuyjyqtk/sql/new>

## Soft delete a user (from the admin UI)

Most of the time you don't need anything below. The admin "Delete" button in the UI does a soft delete: wipes the profile fields, sets `blocked: true` with `blocked_reason: 'DELETED_BY_ADMIN'`. The user can't sign in, but their `auth.users` row is still there. Good for: "this user is abusing the platform and we want a record."

## Hard delete a user (SQL — full erase)

When you need a true erase — most often because you want to re-register the same email as a fresh test user — run this. With the cascade migration in `supabase/migrations/20260417_fix_user_delete_cascades.sql` applied, one command handles it all:

```sql
delete from auth.users where email = 'russellcolevop@gmail.com';
```

What happens in one shot:

- The `auth.users` row is deleted.
- `public.profiles` cascades: the profile row is deleted.
- `public.introductions` cascades on `requested_by`, `person_a`, `person_b`: any intros involving this user are deleted.
- `public.eco_applications`, `public.eco_startups`, `public.eco_activity_log`, `public.eco_program_settings` cascade on their `manager_id` / `applicant_user_id` / `founder_user_id` columns.
- `public.agtech_deals.added_by`, `public.workspace_invites.created_by`, `public.workspace_members.invited_by`, `public.workspaces.owner_id`, `public.ws_sync_log.triggered_by` get set to NULL (these are audit stamps — the record survives, just loses the attribution).

After this runs, the email is free to re-register from scratch.

### Sanity checks before running

```sql
-- Preview: who am I about to delete?
select id, email, created_at, last_sign_in_at
from auth.users
where email = 'russellcolevop@gmail.com';

-- Preview: what would cascade?
select id, email, full_name, is_platform_admin, created_at
from public.profiles
where email = 'russellcolevop@gmail.com';
```

### After the delete

To re-register, go to <https://www.founderopscenter.com>, sign in with that same Google account, and onboard as a fresh user. No profile row exists, so the onboarding flow will fire.

## Re-promote yourself to platform admin after re-register

When you re-register as a fresh user, `is_platform_admin` starts at false. To promote yourself:

```sql
update public.profiles
   set is_platform_admin = true
 where email = 'russellcolevop@gmail.com';
```

## Other one-off operations

(Add to this file as they come up.)
