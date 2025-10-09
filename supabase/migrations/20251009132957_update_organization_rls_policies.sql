/*
  # Update Organization RLS Policies for Public Access

  ## Changes
  - Drop existing restrictive policies
  - Create new policies allowing anonymous/public read access to organizations and members
  - This enables the onboarding flow to work before authentication

  ## Security Notes
  - Organization and member data is read-only for anonymous users
  - Write operations still require authentication
  - This is safe as organization structure is not sensitive
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Organizations are viewable by all authenticated users" ON organizations;
DROP POLICY IF EXISTS "Organization members are viewable by all authenticated users" ON organization_members;

-- Create new public read policies
CREATE POLICY "Organizations are publicly viewable"
  ON organizations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Organization members are publicly viewable"
  ON organization_members FOR SELECT
  TO anon, authenticated
  USING (true);

-- Keep write policies restricted to authenticated users
CREATE POLICY "Authenticated users can update member assignments"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid());
