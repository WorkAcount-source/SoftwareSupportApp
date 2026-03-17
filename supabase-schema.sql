-- ===========================================
-- Supabase Database Schema
-- Support Team Daily Availability Manager
-- ===========================================
-- ⚠️  THIS SCRIPT DROPS AND RECREATES EVERYTHING
-- ===========================================

-- 1. Drop helper functions
DROP FUNCTION IF EXISTS is_editor_or_admin() CASCADE;
DROP FUNCTION IF EXISTS get_user_id_by_email(TEXT) CASCADE;
DROP FUNCTION IF EXISTS is_team_member() CASCADE;
DROP FUNCTION IF EXISTS is_team_admin() CASCADE;

-- 2. Drop tables (CASCADE removes policies + indexes automatically)
DROP TABLE IF EXISTS daily_availability CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS authorized_users CASCADE;

-- ===========================================
-- CREATE TABLES
-- ===========================================

-- Team Members table (also serves as the authorized users list)
-- If a user logs in with an email that matches a team member, they can edit.
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'Support Agent',
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Availability table
CREATE TABLE daily_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  start_hour INTEGER NOT NULL DEFAULT 8 CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour INTEGER NOT NULL DEFAULT 17 CHECK (end_hour >= 0 AND end_hour <= 23),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_member_id, date)
);

-- Indexes
CREATE INDEX idx_daily_availability_date ON daily_availability(date);
CREATE INDEX idx_daily_availability_member ON daily_availability(team_member_id);
CREATE INDEX idx_team_members_email ON team_members(email);

-- ===========================================
-- HELPER FUNCTION: check if current user's email is in team_members
-- ===========================================
CREATE OR REPLACE FUNCTION is_team_member()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE email = auth.jwt()->>'email'
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ===========================================
-- HELPER FUNCTION: check if current user is an admin team member
-- ===========================================
CREATE OR REPLACE FUNCTION is_team_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE email = auth.jwt()->>'email'
      AND is_admin = true
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ===========================================
-- ENABLE ROW LEVEL SECURITY
-- ===========================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_availability ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES
-- ===========================================

-- team_members: anyone can read (public schedule)
CREATE POLICY "Public read access to team_members" ON team_members
  FOR SELECT USING (true);

-- team_members: only admins can write (manage members)
CREATE POLICY "Admin write on team_members" ON team_members
  FOR ALL TO authenticated
  USING (is_team_admin())
  WITH CHECK (is_team_admin());

-- daily_availability: anyone can read
CREATE POLICY "Public read access to daily_availability" ON daily_availability
  FOR SELECT USING (true);

-- daily_availability: only admins can write
CREATE POLICY "Admin write on daily_availability" ON daily_availability
  FOR ALL TO authenticated
  USING (is_team_admin())
  WITH CHECK (is_team_admin());

-- ===========================================
-- SEED: First admin team member
-- ===========================================
INSERT INTO team_members (name, email, role, phone, is_admin)
VALUES ('Shahar', 'shahar.assenheim@rigaku.com', 'SW', '0533402610', true);
