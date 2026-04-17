-- ══════════════════════════════════════════════════════════════
-- ECOSYSTEM WORKSPACE — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- This creates the tables needed for the Ecosystem Manager workspace
-- ══════════════════════════════════════════════════════════════

-- 1. ECOSYSTEM STARTUPS (the pipeline)
-- Each row is a startup in an ecosystem manager's pipeline
-- manager_id = the ecosystem manager's auth.users id
CREATE TABLE IF NOT EXISTS eco_startups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  founder_user_id uuid REFERENCES auth.users(id),  -- links to platform user if they have an account
  name text NOT NULL,
  founder_name text,
  founder_email text,
  stage text DEFAULT 'idea' CHECK (stage IN ('idea','mvp','revenue','scaling')),
  sector text,
  status text DEFAULT 'screening' CHECK (status IN ('screening','active','paused','graduated','dropped')),
  cohort text,
  notes text,
  milestones jsonb DEFAULT '[{"name":"MVP Complete","done":false},{"name":"First Pilot","done":false},{"name":"LOI Secured","done":false},{"name":"Seed Round","done":false}]'::jsonb,
  readiness integer DEFAULT 0 CHECK (readiness >= 0 AND readiness <= 100),
  mentor_names text[] DEFAULT '{}',  -- denormalized for fast reads
  source text DEFAULT 'manual',  -- 'manual', 'application', 'introduction'
  source_ref text,  -- reference to application id or introduction id
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups by manager
CREATE INDEX IF NOT EXISTS idx_eco_startups_manager ON eco_startups(manager_id);
CREATE INDEX IF NOT EXISTS idx_eco_startups_status ON eco_startups(manager_id, status);

-- 2. ECOSYSTEM APPLICATIONS (inbound from founders)
-- When a founder applies to a program, it lands here
CREATE TABLE IF NOT EXISTS eco_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_user_id uuid REFERENCES auth.users(id),  -- if applicant has platform account
  company_name text NOT NULL,
  founder_name text NOT NULL,
  founder_email text,
  stage text,
  sector text,
  pitch text,  -- "What are you building?" — elevator pitch
  team_size text,
  why_this_program text,  -- "Why do you want to join this program?"
  additional_info text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','reviewing','accepted','rejected','waitlisted')),
  reviewer_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_eco_applications_manager ON eco_applications(manager_id);
CREATE INDEX IF NOT EXISTS idx_eco_applications_status ON eco_applications(manager_id, status);

-- 3. ECOSYSTEM ACTIVITY LOG
-- Tracks every action in the workspace for audit and display
CREATE TABLE IF NOT EXISTS eco_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eco_activity_manager ON eco_activity_log(manager_id);

-- 4. ECOSYSTEM PROGRAM SETTINGS
-- Stores the ecosystem manager's program configuration
CREATE TABLE IF NOT EXISTS eco_program_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_name text,
  program_type text,
  description text,
  location text,
  website text,
  accepting_applications boolean DEFAULT true,
  application_deadline text,  -- free-form: "Rolling", "June 30, 2026", etc.
  application_questions jsonb DEFAULT '{"pitch":true,"stage":true,"sector":true,"team_size":true,"why_program":true,"additional":true}'::jsonb,
  cohort_name text DEFAULT 'Spring 2026',
  custom_milestones jsonb,  -- null = use defaults, otherwise custom list
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Each ecosystem manager only sees their own data
-- Admin (Russell) sees everything
-- ══════════════════════════════════════════════════════════════

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid()) IN (
    'russellcolevop@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- eco_startups RLS
ALTER TABLE eco_startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see own startups" ON eco_startups
  FOR SELECT USING (manager_id = auth.uid() OR is_admin());

CREATE POLICY "Managers insert own startups" ON eco_startups
  FOR INSERT WITH CHECK (manager_id = auth.uid() OR is_admin());

CREATE POLICY "Managers update own startups" ON eco_startups
  FOR UPDATE USING (manager_id = auth.uid() OR is_admin());

CREATE POLICY "Managers delete own startups" ON eco_startups
  FOR DELETE USING (manager_id = auth.uid() OR is_admin());

-- eco_applications RLS
ALTER TABLE eco_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see own applications" ON eco_applications
  FOR SELECT USING (manager_id = auth.uid() OR applicant_user_id = auth.uid() OR is_admin());

CREATE POLICY "Anyone can submit applications" ON eco_applications
  FOR INSERT WITH CHECK (true);  -- founders need to insert

CREATE POLICY "Managers update own applications" ON eco_applications
  FOR UPDATE USING (manager_id = auth.uid() OR is_admin());

-- eco_activity_log RLS
ALTER TABLE eco_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see own activity" ON eco_activity_log
  FOR SELECT USING (manager_id = auth.uid() OR is_admin());

CREATE POLICY "Managers insert own activity" ON eco_activity_log
  FOR INSERT WITH CHECK (manager_id = auth.uid() OR is_admin());

-- eco_program_settings RLS
ALTER TABLE eco_program_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see own settings" ON eco_program_settings
  FOR SELECT USING (manager_id = auth.uid() OR is_admin());

CREATE POLICY "Public can read accepting_applications" ON eco_program_settings
  FOR SELECT USING (accepting_applications = true);  -- founders need to see open programs

CREATE POLICY "Managers manage own settings" ON eco_program_settings
  FOR ALL USING (manager_id = auth.uid() OR is_admin());

-- ══════════════════════════════════════════════════════════════
-- AUTO-UPDATE TIMESTAMPS
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER eco_startups_updated_at
  BEFORE UPDATE ON eco_startups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER eco_program_settings_updated_at
  BEFORE UPDATE ON eco_program_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- DONE — Tables are ready for the Ecosystem Workspace
-- The application code will auto-detect these tables and switch
-- from localStorage demo mode to persistent Supabase mode
-- ══════════════════════════════════════════════════════════════
