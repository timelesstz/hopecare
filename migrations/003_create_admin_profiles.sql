-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  access_level TEXT NOT NULL DEFAULT 'standard',
  permissions JSONB DEFAULT '{"dashboard": true, "users": true, "content": false, "settings": false}'::jsonb,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own profile
CREATE POLICY admin_profiles_select_own ON public.admin_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admins can update their own profile (except access_level and permissions)
CREATE POLICY admin_profiles_update_own ON public.admin_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    OLD.access_level = NEW.access_level AND
    OLD.permissions = NEW.permissions
  );

-- Policy: Super admins can read all admin profiles
CREATE POLICY admin_profiles_select_super ON public.admin_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid() AND admin_profiles.access_level = 'super'
    )
  );

-- Policy: Super admins can update all admin profiles
CREATE POLICY admin_profiles_update_super ON public.admin_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid() AND admin_profiles.access_level = 'super'
    )
  );

-- Policy: Super admins can insert new admin profiles
CREATE POLICY admin_profiles_insert_super ON public.admin_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE admin_profiles.id = auth.uid() AND admin_profiles.access_level = 'super'
    )
  );

-- Add trigger to update the updated_at timestamp
CREATE TRIGGER update_admin_profiles_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_admin_profiles_email ON public.admin_profiles(email);
CREATE INDEX idx_admin_profiles_access_level ON public.admin_profiles(access_level);
