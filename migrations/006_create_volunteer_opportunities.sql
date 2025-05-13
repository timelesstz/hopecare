-- Create volunteer_opportunities table
CREATE TABLE IF NOT EXISTS public.volunteer_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  skills_required TEXT[],
  languages_preferred TEXT[],
  commitment_hours INTEGER,
  commitment_type TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  max_volunteers INTEGER,
  coordinator_id UUID REFERENCES public.volunteer_profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create volunteer_assignments table to track volunteer assignments to opportunities
CREATE TABLE IF NOT EXISTS public.volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteer_profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.volunteer_opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(volunteer_id, opportunity_id)
);

-- Create volunteer_hours table to track volunteer hours
CREATE TABLE IF NOT EXISTS public.volunteer_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteer_profiles(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.volunteer_opportunities(id) ON DELETE SET NULL,
  hours NUMERIC(5,2) NOT NULL,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create background_checks table
CREATE TABLE IF NOT EXISTS public.background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteer_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  result TEXT,
  provider TEXT,
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for volunteer_opportunities
ALTER TABLE public.volunteer_opportunities ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read open volunteer opportunities
CREATE POLICY volunteer_opportunities_select_open ON public.volunteer_opportunities
  FOR SELECT USING (status = 'open');

-- Policy: Volunteers can read opportunities they're assigned to
CREATE POLICY volunteer_opportunities_select_assigned ON public.volunteer_opportunities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.volunteer_assignments
      WHERE volunteer_assignments.opportunity_id = id AND volunteer_assignments.volunteer_id = auth.uid()
    )
  );

-- Policy: Admins and coordinators can read all opportunities
CREATE POLICY volunteer_opportunities_select_admin ON public.volunteer_opportunities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'coordinator')
    )
  );

-- Policy: Admins and coordinators can insert opportunities
CREATE POLICY volunteer_opportunities_insert_admin ON public.volunteer_opportunities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'coordinator')
    )
  );

-- Policy: Admins and coordinators can update opportunities
CREATE POLICY volunteer_opportunities_update_admin ON public.volunteer_opportunities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'coordinator')
    )
  );

-- Add RLS policies for volunteer_assignments
ALTER TABLE public.volunteer_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Volunteers can read their own assignments
CREATE POLICY volunteer_assignments_select_own ON public.volunteer_assignments
  FOR SELECT USING (volunteer_id = auth.uid());

-- Policy: Volunteers can insert their own assignments (apply for opportunities)
CREATE POLICY volunteer_assignments_insert_own ON public.volunteer_assignments
  FOR INSERT WITH CHECK (
    volunteer_id = auth.uid() AND
    status = 'pending'
  );

-- Policy: Admins and coordinators can read all assignments
CREATE POLICY volunteer_assignments_select_admin ON public.volunteer_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'coordinator')
    )
  );

-- Policy: Admins and coordinators can update assignments
CREATE POLICY volunteer_assignments_update_admin ON public.volunteer_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'coordinator')
    )
  );

-- Add RLS policies for volunteer_hours
ALTER TABLE public.volunteer_hours ENABLE ROW LEVEL SECURITY;

-- Policy: Volunteers can read their own hours
CREATE POLICY volunteer_hours_select_own ON public.volunteer_hours
  FOR SELECT USING (volunteer_id = auth.uid());

-- Policy: Volunteers can insert their own hours
CREATE POLICY volunteer_hours_insert_own ON public.volunteer_hours
  FOR INSERT WITH CHECK (
    volunteer_id = auth.uid() AND
    status = 'pending'
  );

-- Policy: Volunteers can update their own pending hours
CREATE POLICY volunteer_hours_update_own ON public.volunteer_hours
  FOR UPDATE USING (
    volunteer_id = auth.uid() AND
    status = 'pending'
  );

-- Policy: Admins and coordinators can read all hours
CREATE POLICY volunteer_hours_select_admin ON public.volunteer_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'coordinator')
    )
  );

-- Policy: Admins and coordinators can update hours
CREATE POLICY volunteer_hours_update_admin ON public.volunteer_hours
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND (users.role = 'admin' OR users.role = 'coordinator')
    )
  );

-- Add RLS policies for background_checks
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;

-- Policy: Volunteers can read their own background checks
CREATE POLICY background_checks_select_own ON public.background_checks
  FOR SELECT USING (volunteer_id = auth.uid());

-- Policy: Admins can read all background checks
CREATE POLICY background_checks_select_admin ON public.background_checks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policy: Admins can update background checks
CREATE POLICY background_checks_update_admin ON public.background_checks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Add triggers to update the updated_at timestamp
CREATE TRIGGER update_volunteer_opportunities_updated_at
BEFORE UPDATE ON public.volunteer_opportunities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_assignments_updated_at
BEFORE UPDATE ON public.volunteer_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_hours_updated_at
BEFORE UPDATE ON public.volunteer_hours
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_background_checks_updated_at
BEFORE UPDATE ON public.background_checks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_volunteer_opportunities_status ON public.volunteer_opportunities(status);
CREATE INDEX idx_volunteer_opportunities_start_date ON public.volunteer_opportunities(start_date);
CREATE INDEX idx_volunteer_assignments_volunteer_id ON public.volunteer_assignments(volunteer_id);
CREATE INDEX idx_volunteer_assignments_opportunity_id ON public.volunteer_assignments(opportunity_id);
CREATE INDEX idx_volunteer_assignments_status ON public.volunteer_assignments(status);
CREATE INDEX idx_volunteer_hours_volunteer_id ON public.volunteer_hours(volunteer_id);
CREATE INDEX idx_volunteer_hours_activity_date ON public.volunteer_hours(activity_date);
CREATE INDEX idx_volunteer_hours_status ON public.volunteer_hours(status);
CREATE INDEX idx_background_checks_volunteer_id ON public.background_checks(volunteer_id);
CREATE INDEX idx_background_checks_status ON public.background_checks(status);
