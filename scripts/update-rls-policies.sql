-- Update RLS Policies for HopeCare Supabase Migration
-- Run this script in the Supabase SQL Editor to update RLS policies

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS users_update_own ON public.users;
DROP POLICY IF EXISTS users_select_admin ON public.users;
DROP POLICY IF EXISTS users_update_admin ON public.users;
DROP POLICY IF EXISTS users_insert_admin ON public.users;
DROP POLICY IF EXISTS users_insert_service_role ON public.users;

-- Policy: Users can read their own profile
CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can read all user profiles
CREATE POLICY users_select_admin ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- Policy: Admins can update all user profiles
CREATE POLICY users_update_admin ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- Policy: Admins can insert new users
CREATE POLICY users_insert_admin ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'ADMIN'
    )
  );

-- Policy: Allow service role to insert users (for user registration)
CREATE POLICY users_insert_service_role ON public.users
  FOR INSERT WITH CHECK (true);

-- Donor profiles policies
DROP POLICY IF EXISTS donor_profiles_insert_service_role ON public.donor_profiles;
CREATE POLICY donor_profiles_insert_service_role ON public.donor_profiles
  FOR INSERT WITH CHECK (true);

-- Volunteer profiles policies
DROP POLICY IF EXISTS volunteer_profiles_insert_service_role ON public.volunteer_profiles;
CREATE POLICY volunteer_profiles_insert_service_role ON public.volunteer_profiles
  FOR INSERT WITH CHECK (true);

-- Admin profiles policies
DROP POLICY IF EXISTS admin_profiles_insert_service_role ON public.admin_profiles;
CREATE POLICY admin_profiles_insert_service_role ON public.admin_profiles
  FOR INSERT WITH CHECK (true);

-- Blog posts policies
DROP POLICY IF EXISTS blog_posts_insert_service_role ON public.blog_posts;
CREATE POLICY blog_posts_insert_service_role ON public.blog_posts
  FOR INSERT WITH CHECK (true);

-- Pages policies
DROP POLICY IF EXISTS pages_insert_service_role ON public.pages;
CREATE POLICY pages_insert_service_role ON public.pages
  FOR INSERT WITH CHECK (true);

-- Donations policies
DROP POLICY IF EXISTS donations_insert_service_role ON public.donations;
CREATE POLICY donations_insert_service_role ON public.donations
  FOR INSERT WITH CHECK (true);

-- Volunteer opportunities policies
DROP POLICY IF EXISTS volunteer_opportunities_insert_service_role ON public.volunteer_opportunities;
CREATE POLICY volunteer_opportunities_insert_service_role ON public.volunteer_opportunities
  FOR INSERT WITH CHECK (true);

-- Volunteer applications policies
DROP POLICY IF EXISTS volunteer_applications_insert_service_role ON public.volunteer_applications;
CREATE POLICY volunteer_applications_insert_service_role ON public.volunteer_applications
  FOR INSERT WITH CHECK (true);

-- Content revisions policies
DROP POLICY IF EXISTS content_revisions_insert_service_role ON public.content_revisions;
CREATE POLICY content_revisions_insert_service_role ON public.content_revisions
  FOR INSERT WITH CHECK (true);

-- Helper functions
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
