-- Create volunteer_profiles table
CREATE TABLE IF NOT EXISTS public.volunteer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  skills TEXT[],
  languages TEXT[],
  experience TEXT,
  weekday_availability BOOLEAN DEFAULT FALSE,
  weekend_availability BOOLEAN DEFAULT FALSE,
  evening_availability BOOLEAN DEFAULT FALSE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  hours_logged INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  background_check_status TEXT,
  background_check_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create volunteer_certifications table for the certifications array
CREATE TABLE IF NOT EXISTS public.volunteer_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for volunteer_profiles
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own volunteer profile
CREATE POLICY volunteer_profiles_select_own ON public.volunteer_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own volunteer profile
CREATE POLICY volunteer_profiles_update_own ON public.volunteer_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can read all volunteer profiles
CREATE POLICY volunteer_profiles_select_admin ON public.volunteer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can update all volunteer profiles
CREATE POLICY volunteer_profiles_update_admin ON public.volunteer_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add RLS policies for volunteer_certifications
ALTER TABLE public.volunteer_certifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own certifications
CREATE POLICY volunteer_certifications_select_own ON public.volunteer_certifications
  FOR SELECT USING (
    volunteer_id = auth.uid()
  );

-- Policy: Users can insert their own certifications
CREATE POLICY volunteer_certifications_insert_own ON public.volunteer_certifications
  FOR INSERT WITH CHECK (
    volunteer_id = auth.uid()
  );

-- Policy: Users can update their own certifications
CREATE POLICY volunteer_certifications_update_own ON public.volunteer_certifications
  FOR UPDATE USING (
    volunteer_id = auth.uid()
  );

-- Policy: Users can delete their own certifications
CREATE POLICY volunteer_certifications_delete_own ON public.volunteer_certifications
  FOR DELETE USING (
    volunteer_id = auth.uid()
  );

-- Policy: Admins can manage all certifications
CREATE POLICY volunteer_certifications_all_admin ON public.volunteer_certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add trigger to update the updated_at timestamp for volunteer_profiles
CREATE TRIGGER update_volunteer_profiles_updated_at
BEFORE UPDATE ON public.volunteer_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to update the updated_at timestamp for volunteer_certifications
CREATE TRIGGER update_volunteer_certifications_updated_at
BEFORE UPDATE ON public.volunteer_certifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_volunteer_profiles_email ON public.volunteer_profiles(email);
CREATE INDEX idx_volunteer_certifications_volunteer_id ON public.volunteer_certifications(volunteer_id);
