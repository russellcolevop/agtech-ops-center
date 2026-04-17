-- 20260417_fix_user_delete_cascades.sql
--
-- Purpose: replace NO ACTION / RESTRICT foreign-key delete rules on columns
-- that reference auth.users and public.profiles with appropriate
-- CASCADE or SET NULL behavior, so that deleting a user from
-- Supabase Auth no longer errors out with FK violations.
--
-- Decision rubric:
--   * CASCADE  — the row is meaningless without the user (the user IS the
--                subject of the row). Deleting the user deletes the row.
--   * SET NULL — the row stands on its own; the user column is an audit
--                stamp or historical attribution. Deleting the user keeps
--                the row but nulls the attribution.
--
-- Per-column choices below. Each block drops the existing FK constraint
-- and re-adds it with the new delete rule. Wrapped in one transaction
-- so the change is atomic.

begin;

-- ─────────────────────────────────────────────────────────────────────
-- FKs to auth.users
-- ─────────────────────────────────────────────────────────────────────

-- agtech_deals.added_by → auth.users.id
-- Audit stamp. Keep the deal, drop the attribution.
alter table public.agtech_deals
  drop constraint if exists agtech_deals_added_by_fkey;
alter table public.agtech_deals
  add  constraint agtech_deals_added_by_fkey
  foreign key (added_by) references auth.users(id) on delete set null;

-- eco_applications.applicant_user_id → auth.users.id
-- The user IS the applicant.
alter table public.eco_applications
  drop constraint if exists eco_applications_applicant_user_id_fkey;
alter table public.eco_applications
  add  constraint eco_applications_applicant_user_id_fkey
  foreign key (applicant_user_id) references auth.users(id) on delete cascade;

-- eco_startups.founder_user_id → auth.users.id
-- The user IS the founder of the startup row.
alter table public.eco_startups
  drop constraint if exists eco_startups_founder_user_id_fkey;
alter table public.eco_startups
  add  constraint eco_startups_founder_user_id_fkey
  foreign key (founder_user_id) references auth.users(id) on delete cascade;

-- introductions.requested_by → auth.users.id
-- If the requester is gone, the intro request is gone.
alter table public.introductions
  drop constraint if exists introductions_requested_by_fkey;
alter table public.introductions
  add  constraint introductions_requested_by_fkey
  foreign key (requested_by) references auth.users(id) on delete cascade;

-- workspace_invites.created_by → auth.users.id
-- Audit stamp; the invite itself may still be valid/claimable.
alter table public.workspace_invites
  drop constraint if exists workspace_invites_created_by_fkey;
alter table public.workspace_invites
  add  constraint workspace_invites_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

-- workspace_members.invited_by → auth.users.id
-- Audit stamp on the membership record.
alter table public.workspace_members
  drop constraint if exists workspace_members_invited_by_fkey;
alter table public.workspace_members
  add  constraint workspace_members_invited_by_fkey
  foreign key (invited_by) references auth.users(id) on delete set null;

-- workspaces.owner_id → auth.users.id
-- DECISION PENDING — see chat. Default below is SET NULL (workspace
-- survives as orphan, admin reassigns). If Russell picks CASCADE, change
-- the action below to "cascade" and also remove the "drop not null" step.
alter table public.workspaces
  alter column owner_id drop not null;
alter table public.workspaces
  drop constraint if exists workspaces_owner_id_fkey;
alter table public.workspaces
  add  constraint workspaces_owner_id_fkey
  foreign key (owner_id) references auth.users(id) on delete set null;

-- ws_sync_log.triggered_by → auth.users.id
-- Log history; keep the log entry, null the actor.
alter table public.ws_sync_log
  drop constraint if exists ws_sync_log_triggered_by_fkey;
alter table public.ws_sync_log
  add  constraint ws_sync_log_triggered_by_fkey
  foreign key (triggered_by) references auth.users(id) on delete set null;

-- ─────────────────────────────────────────────────────────────────────
-- FKs to public.profiles
-- ─────────────────────────────────────────────────────────────────────

-- introductions.person_a → public.profiles.id
-- The intro is about this person; remove the person, remove the intro.
alter table public.introductions
  drop constraint if exists introductions_person_a_fkey;
alter table public.introductions
  add  constraint introductions_person_a_fkey
  foreign key (person_a) references public.profiles(id) on delete cascade;

-- introductions.person_b → public.profiles.id
alter table public.introductions
  drop constraint if exists introductions_person_b_fkey;
alter table public.introductions
  add  constraint introductions_person_b_fkey
  foreign key (person_b) references public.profiles(id) on delete cascade;

commit;

-- ─────────────────────────────────────────────────────────────────────
-- Verification query — run after commit to confirm new delete rules.
-- Expected: every row below has delete_rule of 'c' (cascade) or 'n' (set null),
-- never 'a' (no action) or 'r' (restrict).
-- ─────────────────────────────────────────────────────────────────────
-- select n.nspname as table_schema,
--        c.relname as table_name,
--        a.attname as column_name,
--        con.confdeltype as delete_rule,
--        fn.nspname || '.' || fc.relname as references_table
-- from pg_constraint con
-- join pg_class     c  on c.oid = con.conrelid
-- join pg_namespace n  on n.oid = c.relnamespace
-- join pg_attribute a  on a.attrelid = con.conrelid and a.attnum = any(con.conkey)
-- join pg_class     fc on fc.oid = con.confrelid
-- join pg_namespace fn on fn.oid = fc.relnamespace
-- where con.contype = 'f'
--   and ((fn.nspname = 'auth'   and fc.relname = 'users')
--     or (fn.nspname = 'public' and fc.relname = 'profiles'))
-- order by n.nspname, c.relname, a.attname;
