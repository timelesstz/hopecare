-- Migration: Create Volunteer-Related Tables
-- Description: This migration creates additional tables for volunteer management

-- Create volunteer_certifications table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.volunteer_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on volunteer_id for faster lookups
CREATE INDEX IF NOT EXISTS volunteer_certifications_volunteer_id_idx ON public.volunteer_certifications(volunteer_id);

-- Enable RLS on volunteer_certifications
ALTER TABLE public.volunteer_certifications ENABLE ROW LEVEL SECURITY;

-- Policy: Volunteers can view their own certifications
CREATE POLICY volunteer_certifications_select_own ON public.volunteer_certifications 
  FOR SELECT 
  USING (auth.uid() = volunteer_id);

-- Policy: Volunteers can manage their own certifications
CREATE POLICY volunteer_certifications_all_own ON public.volunteer_certifications 
  USING (auth.uid() = volunteer_id);

-- Policy: Admins can view and manage all certifications
CREATE POLICY volunteer_certifications_all_admin ON public.volunteer_certifications 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create volunteer_applications table
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteer_profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Add constraint for unique volunteer-opportunity pair
  UNIQUE (volunteer_id, opportunity_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS volunteer_applications_volunteer_id_idx ON public.volunteer_applications(volunteer_id);
CREATE INDEX IF NOT EXISTS volunteer_applications_opportunity_id_idx ON public.volunteer_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS volunteer_applications_status_idx ON public.volunteer_applications(status);

-- Enable RLS on volunteer_applications
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Volunteers can view their own applications
CREATE POLICY volunteer_applications_select_own ON public.volunteer_applications 
  FOR SELECT 
  USING (auth.uid() = volunteer_id);

-- Policy: Volunteers can create their own applications
CREATE POLICY volunteer_applications_insert_own ON public.volunteer_applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = volunteer_id);

-- Policy: Admins can view and manage all applications
CREATE POLICY volunteer_applications_all_admin ON public.volunteer_applications 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create volunteer_hours table
CREATE TABLE IF NOT EXISTS public.volunteer_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteer_profiles(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  hours NUMERIC NOT NULL,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS volunteer_hours_volunteer_id_idx ON public.volunteer_hours(volunteer_id);
CREATE INDEX IF NOT EXISTS volunteer_hours_opportunity_id_idx ON public.volunteer_hours(opportunity_id);
CREATE INDEX IF NOT EXISTS volunteer_hours_status_idx ON public.volunteer_hours(status);
CREATE INDEX IF NOT EXISTS volunteer_hours_activity_date_idx ON public.volunteer_hours(activity_date);

-- Enable RLS on volunteer_hours
ALTER TABLE public.volunteer_hours ENABLE ROW LEVEL SECURITY;

-- Policy: Volunteers can view their own hours
CREATE POLICY volunteer_hours_select_own ON public.volunteer_hours 
  FOR SELECT 
  USING (auth.uid() = volunteer_id);

-- Policy: Volunteers can create their own hours
CREATE POLICY volunteer_hours_insert_own ON public.volunteer_hours 
  FOR INSERT 
  WITH CHECK (auth.uid() = volunteer_id);

-- Policy: Volunteers can update their own pending hours
CREATE POLICY volunteer_hours_update_own ON public.volunteer_hours 
  FOR UPDATE 
  USING (auth.uid() = volunteer_id AND status = 'pending');

-- Policy: Admins can view and manage all hours
CREATE POLICY volunteer_hours_all_admin ON public.volunteer_hours 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create background_checks table
CREATE TABLE IF NOT EXISTS public.background_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteer_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  check_type TEXT NOT NULL,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS background_checks_volunteer_id_idx ON public.background_checks(volunteer_id);
CREATE INDEX IF NOT EXISTS background_checks_status_idx ON public.background_checks(status);

-- Enable RLS on background_checks
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;

-- Policy: Volunteers can view their own background checks
CREATE POLICY background_checks_select_own ON public.background_checks 
  FOR SELECT 
  USING (auth.uid() = volunteer_id);

-- Policy: Admins can view and manage all background checks
CREATE POLICY background_checks_all_admin ON public.background_checks 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create volunteer_statistics view
CREATE OR REPLACE VIEW public.volunteer_statistics AS
SELECT 
  vp.id AS volunteer_id,
  u.email,
  vp.full_name,
  COALESCE(SUM(vh.hours) FILTER (WHERE vh.status = 'approved'), 0) AS total_hours,
  COUNT(DISTINCT vh.opportunity_id) FILTER (WHERE vh.status = 'approved' AND vh.opportunity_id IS NOT NULL) AS total_opportunities,
  MIN(vh.activity_date) FILTER (WHERE vh.status = 'approved') AS first_volunteer_date,
  MAX(vh.activity_date) FILTER (WHERE vh.status = 'approved') AS last_volunteer_date,
  COUNT(vc.id) AS certification_count,
  (
    SELECT COUNT(*) 
    FROM public.background_checks bc 
    WHERE bc.volunteer_id = vp.id AND bc.status = 'approved' AND (bc.expires_at IS NULL OR bc.expires_at > NOW())
  ) AS valid_background_checks
FROM 
  public.volunteer_profiles vp
JOIN 
  public.users u ON vp.id = u.id
LEFT JOIN 
  public.volunteer_hours vh ON vp.id = vh.volunteer_id
LEFT JOIN 
  public.volunteer_certifications vc ON vp.id = vc.volunteer_id
GROUP BY 
  vp.id, u.email, vp.full_name;

-- Comment on view
COMMENT ON VIEW public.volunteer_statistics IS 'View for generating volunteer statistics and reports';

-- Add RLS policy for the view
CREATE POLICY volunteer_statistics_select_admin ON public.volunteer_statistics
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policy for volunteers to see their own statistics
CREATE POLICY volunteer_statistics_select_own ON public.volunteer_statistics
  FOR SELECT 
  USING (volunteer_id = auth.uid());

-- Create volunteer_opportunity_function to handle opportunity applications
CREATE OR REPLACE FUNCTION public.apply_for_opportunity(
  p_volunteer_id UUID,
  p_opportunity_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_opportunity RECORD;
  v_application_id UUID;
  v_applicants UUID[];
  v_result JSONB;
BEGIN
  -- Check if volunteer exists
  IF NOT EXISTS (SELECT 1 FROM public.volunteer_profiles WHERE id = p_volunteer_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Volunteer profile not found');
  END IF;
  
  -- Check if opportunity exists and is open
  SELECT * INTO v_opportunity FROM public.opportunities WHERE id = p_opportunity_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Opportunity not found');
  END IF;
  
  IF v_opportunity.status != 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Opportunity is not open for applications');
  END IF;
  
  -- Check if already applied
  IF EXISTS (SELECT 1 FROM public.volunteer_applications 
             WHERE volunteer_id = p_volunteer_id AND opportunity_id = p_opportunity_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already applied to this opportunity');
  END IF;
  
  -- Check if opportunity is full
  IF v_opportunity.max_volunteers IS NOT NULL AND 
     v_opportunity.current_volunteers >= v_opportunity.max_volunteers THEN
    RETURN jsonb_build_object('success', false, 'error', 'Opportunity is full');
  END IF;
  
  -- Create application
  INSERT INTO public.volunteer_applications (
    volunteer_id, 
    opportunity_id, 
    status, 
    message, 
    created_at, 
    updated_at
  ) 
  VALUES (
    p_volunteer_id, 
    p_opportunity_id, 
    'pending', 
    p_message, 
    NOW(), 
    NOW()
  )
  RETURNING id INTO v_application_id;
  
  -- Update opportunity's applicants array
  v_applicants := v_opportunity.applicants;
  IF v_applicants IS NULL THEN
    v_applicants := ARRAY[p_volunteer_id];
  ELSIF NOT (p_volunteer_id = ANY(v_applicants)) THEN
    v_applicants := array_append(v_applicants, p_volunteer_id);
  END IF;
  
  UPDATE public.opportunities
  SET applicants = v_applicants,
      updated_at = NOW()
  WHERE id = p_opportunity_id;
  
  -- Log activity
  INSERT INTO public.activity_logs (
    user_id, 
    action, 
    entity_type, 
    entity_id, 
    created_at
  ) 
  VALUES (
    p_volunteer_id, 
    'opportunity_apply', 
    'opportunity', 
    p_opportunity_id, 
    NOW()
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'application_id', v_application_id, 
    'message', 'Application submitted successfully'
  );
END;
$$;

-- Comment on function
COMMENT ON FUNCTION public.apply_for_opportunity IS 'Function to handle volunteer applications for opportunities';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.apply_for_opportunity TO authenticated;
GRANT SELECT ON public.volunteer_statistics TO authenticated;
