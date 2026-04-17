-- FounderOps Center: Badge/Tier System + Profile Verification Gate
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/odvwxgxhacotiuyjyqtk/sql/new)

-- Profile completeness & verification
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completeness integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_warned_at timestamptz;

-- Badge & tier system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier text DEFAULT 'explorer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS intro_tier_pref text DEFAULT 'explorer';

-- Index for tier filtering on introductions
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_completeness ON profiles(profile_completeness);
