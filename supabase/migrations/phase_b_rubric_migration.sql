-- ============================================================================
-- Phase B: Rubric Builder — schema migration
-- Run this once in the Supabase SQL editor (project: odvwxgxhacotiuyjyqtk).
-- Idempotent: safe to re-run.
-- ============================================================================

-- Add a JSONB column on eco_program_settings to persist each manager's custom
-- rubric. When NULL, the app falls back to STARTER_RUBRIC defaults in index.html.
alter table public.eco_program_settings
  add column if not exists rubric jsonb;

-- Optional: a comment so the schema is self-documenting in the Supabase table editor.
comment on column public.eco_program_settings.rubric is
  'Custom scoring rubric for this workspace. Shape: { version, scoreLabels{1..4}, scoreColors{1..4}, dimensions[3]{key,label,desc}, totalTiers[3]{label,min,max,color,desc}, maxTotal }. NULL means the Starter Rubric defaults are used.';

-- ============================================================================
-- Sanity check — paste into the SQL editor after running the migration
-- ============================================================================
-- select column_name, data_type
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name   = 'eco_program_settings'
--   and column_name  = 'rubric';
