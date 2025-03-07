-- Function to update volunteer total hours
CREATE OR REPLACE FUNCTION update_volunteer_total_hours(
  volunteer_id UUID,
  hours_to_add NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE volunteer_profiles
  SET 
    total_hours = total_hours + hours_to_add,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = volunteer_id;
END;
$$;

-- Function to get available volunteers for an opportunity
CREATE OR REPLACE FUNCTION get_available_volunteers(
  opportunity_id UUID,
  required_skills TEXT[] DEFAULT NULL,
  required_date DATE DEFAULT NULL
)
RETURNS TABLE (
  volunteer_id UUID,
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  skills TEXT[],
  total_hours NUMERIC,
  background_check_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vp.user_id as volunteer_id,
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    vp.skills,
    vp.total_hours,
    vp.background_check_status
  FROM volunteer_profiles vp
  JOIN users u ON u.id = vp.user_id
  WHERE 
    vp.background_check_status = 'approved'
    AND (required_skills IS NULL OR vp.skills @> required_skills)
    AND NOT EXISTS (
      -- Check if volunteer is already assigned to another opportunity at the same time
      SELECT 1 
      FROM volunteer_assignments va
      WHERE 
        va.volunteer_id = vp.user_id
        AND va.date = required_date
    )
  ORDER BY vp.total_hours DESC;
END;
$$;

-- Function to get volunteer schedule
CREATE OR REPLACE FUNCTION get_volunteer_schedule(
  volunteer_id UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  assignment_id UUID,
  opportunity_id UUID,
  opportunity_title TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  status TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    va.id as assignment_id,
    va.opportunity_id,
    vo.title as opportunity_title,
    va.date,
    va.start_time,
    va.end_time,
    va.status
  FROM volunteer_assignments va
  JOIN volunteer_opportunities vo ON vo.id = va.opportunity_id
  WHERE 
    va.volunteer_id = volunteer_id
    AND va.date BETWEEN start_date AND end_date
  ORDER BY va.date, va.start_time;
$$;

-- Function to get volunteer hours summary
CREATE OR REPLACE FUNCTION get_volunteer_hours_summary(
  volunteer_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_hours NUMERIC,
  approved_hours NUMERIC,
  pending_hours NUMERIC,
  opportunities_count INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(SUM(hours), 0) as total_hours,
    COALESCE(SUM(CASE WHEN status = 'approved' THEN hours ELSE 0 END), 0) as approved_hours,
    COALESCE(SUM(CASE WHEN status = 'pending' THEN hours ELSE 0 END), 0) as pending_hours,
    COUNT(DISTINCT opportunity_id) as opportunities_count
  FROM volunteer_hours
  WHERE 
    volunteer_id = volunteer_id
    AND (start_date IS NULL OR date >= start_date)
    AND (end_date IS NULL OR date <= end_date);
$$;

-- Function to get background check status
CREATE OR REPLACE FUNCTION get_background_check_status(
  volunteer_id UUID
)
RETURNS TABLE (
  status TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  documents JSONB,
  notes TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    status,
    submitted_at,
    processed_at,
    documents,
    notes
  FROM background_checks
  WHERE volunteer_id = volunteer_id
  ORDER BY submitted_at DESC
  LIMIT 1;
$$;

-- Function to swap volunteer shifts
CREATE OR REPLACE FUNCTION swap_volunteer_shifts(
  assignment1_id UUID,
  assignment2_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  temp_volunteer_id UUID;
BEGIN
  -- Get volunteer ID from first assignment
  SELECT volunteer_id INTO temp_volunteer_id
  FROM volunteer_assignments
  WHERE id = assignment1_id;
  
  -- Swap volunteers
  UPDATE volunteer_assignments
  SET volunteer_id = (
    SELECT volunteer_id 
    FROM volunteer_assignments 
    WHERE id = assignment2_id
  )
  WHERE id = assignment1_id;
  
  UPDATE volunteer_assignments
  SET volunteer_id = temp_volunteer_id
  WHERE id = assignment2_id;
  
  -- Log the swap
  INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    temp_volunteer_id,
    'shift_swapped',
    'volunteer_assignment',
    assignment1_id,
    jsonb_build_object(
      'swapped_with', assignment2_id,
      'timestamp', CURRENT_TIMESTAMP
    )
  );
END;
$$; 