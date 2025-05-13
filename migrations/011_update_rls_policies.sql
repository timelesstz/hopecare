-- Migration: Update RLS Policies for Supabase Migration
-- This migration adjusts the Row Level Security policies to properly handle
-- service role access and fix user registration issues

-- 1. Update RLS policies for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
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
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 2. Update RLS policies for donor_profiles table
DROP POLICY IF EXISTS donor_profiles_insert_service_role ON public.donor_profiles;

-- Policy: Allow service role to insert donor profiles
CREATE POLICY donor_profiles_insert_service_role ON public.donor_profiles
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 3. Update RLS policies for volunteer_profiles table
DROP POLICY IF EXISTS volunteer_profiles_insert_service_role ON public.volunteer_profiles;

-- Policy: Allow service role to insert volunteer profiles
CREATE POLICY volunteer_profiles_insert_service_role ON public.volunteer_profiles
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 4. Update RLS policies for admin_profiles table
DROP POLICY IF EXISTS admin_profiles_insert_service_role ON public.admin_profiles;

-- Policy: Allow service role to insert admin profiles
CREATE POLICY admin_profiles_insert_service_role ON public.admin_profiles
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 5. Update RLS policies for blog_posts table
DROP POLICY IF EXISTS blog_posts_insert_service_role ON public.blog_posts;

-- Policy: Allow service role to insert blog posts
CREATE POLICY blog_posts_insert_service_role ON public.blog_posts
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 6. Update RLS policies for pages table
DROP POLICY IF EXISTS pages_insert_service_role ON public.pages;

-- Policy: Allow service role to insert pages
CREATE POLICY pages_insert_service_role ON public.pages
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 7. Update RLS policies for donations table
DROP POLICY IF EXISTS donations_insert_service_role ON public.donations;

-- Policy: Allow service role to insert donations
CREATE POLICY donations_insert_service_role ON public.donations
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 8. Update RLS policies for volunteer_opportunities table
DROP POLICY IF EXISTS volunteer_opportunities_insert_service_role ON public.volunteer_opportunities;

-- Policy: Allow service role to insert volunteer opportunities
CREATE POLICY volunteer_opportunities_insert_service_role ON public.volunteer_opportunities
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 9. Update RLS policies for volunteer_applications table
DROP POLICY IF EXISTS volunteer_applications_insert_service_role ON public.volunteer_applications;

-- Policy: Allow service role to insert volunteer applications
CREATE POLICY volunteer_applications_insert_service_role ON public.volunteer_applications
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 10. Update RLS policies for content_revisions table
DROP POLICY IF EXISTS content_revisions_insert_service_role ON public.content_revisions;

-- Policy: Allow service role to insert content revisions
CREATE POLICY content_revisions_insert_service_role ON public.content_revisions
  FOR INSERT TO authenticated, anon, service_role
  WITH CHECK (true);

-- 11. Create helper function to check if request is from service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
