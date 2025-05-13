-- Create donor_profiles table
CREATE TABLE IF NOT EXISTS public.donor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  preferred_causes TEXT[],
  donation_frequency TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  receive_updates BOOLEAN DEFAULT TRUE,
  total_donated NUMERIC(10,2) DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for donor_profiles
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own donor profile
CREATE POLICY donor_profiles_select_own ON public.donor_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own donor profile
CREATE POLICY donor_profiles_update_own ON public.donor_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can read all donor profiles
CREATE POLICY donor_profiles_select_admin ON public.donor_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can update all donor profiles
CREATE POLICY donor_profiles_update_admin ON public.donor_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donor_profiles_updated_at
BEFORE UPDATE ON public.donor_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_donor_profiles_email ON public.donor_profiles(email);
CREATE INDEX idx_donor_profiles_donation_frequency ON public.donor_profiles(donation_frequency);
