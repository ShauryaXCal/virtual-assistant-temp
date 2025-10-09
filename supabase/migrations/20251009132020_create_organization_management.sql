/*
  # Organization Management System

  ## Overview
  Creates a healthcare organization structure with members who can select their role during onboarding.

  ## New Tables

  ### 1. `organizations`
  Stores healthcare organization information
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Organization name
  - `type` (text) - Organization type (hospital, clinic, etc.)
  - `location` (text) - Organization location
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `organization_members`
  Stores individual members of the organization
  - `id` (uuid, primary key) - Unique identifier
  - `organization_id` (uuid, foreign key) - Organization reference
  - `user_id` (uuid, nullable, foreign key) - Auth user reference (null until selected)
  - `full_name` (text) - Member's full name
  - `role` (text) - Job role (Primary Care Physician, Cardiologist, Nurse, CQM Specialist)
  - `specialty` (text) - Medical specialty
  - `location` (text) - Office/department location
  - `email` (text) - Contact email
  - `is_available` (boolean) - Whether member can be selected
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `user_sessions`
  Tracks which organization member a user has selected
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Auth user reference
  - `member_id` (uuid, foreign key) - Selected organization member
  - `focus_area` (text) - User's stated focus for the session
  - `created_at` (timestamptz) - Session creation timestamp
  - `last_active` (timestamptz) - Last activity timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Organization members are publicly viewable for selection
  - User sessions are private to the authenticated user
  - Member selection updates are restricted

  ## Important Notes
  1. Members are pre-created and users select which member they represent
  2. Multiple users can view members but only unassigned members can be claimed
  3. Sessions track user focus areas and activity
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations are viewable by all authenticated users"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

-- Create organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  role text NOT NULL,
  specialty text NOT NULL,
  location text NOT NULL,
  email text NOT NULL,
  is_available boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members are viewable by all authenticated users"
  ON organization_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own member assignment"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES organization_members(id) ON DELETE CASCADE NOT NULL,
  focus_area text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_member_id ON user_sessions(member_id);
