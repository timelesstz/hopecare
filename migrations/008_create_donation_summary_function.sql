-- Migration: Create Donation Summary Function
-- Description: This migration creates a PostgreSQL function for generating donation summaries by time period

-- Create the donation summary function
CREATE OR REPLACE FUNCTION public.get_donation_summary(
  start_date TEXT DEFAULT NULL,
  end_date TEXT DEFAULT NULL,
  group_by TEXT DEFAULT 'month',
  date_format TEXT DEFAULT 'YYYY-MM'
)
RETURNS TABLE (
  time_period TEXT,
  total_amount NUMERIC,
  donation_count BIGINT,
  currency TEXT,
  avg_amount NUMERIC,
  min_amount NUMERIC,
  max_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_donations AS (
    SELECT
      d.amount,
      d.currency,
      d.donation_date,
      d.status
    FROM
      public.donations d
    WHERE
      d.status = 'completed'
      AND (start_date IS NULL OR d.donation_date >= start_date::timestamp)
      AND (end_date IS NULL OR d.donation_date <= end_date::timestamp)
  )
  SELECT
    CASE
      WHEN group_by = 'day' THEN to_char(fd.donation_date::timestamp, 'YYYY-MM-DD')
      WHEN group_by = 'week' THEN to_char(date_trunc('week', fd.donation_date::timestamp), 'YYYY-WW')
      WHEN group_by = 'month' THEN to_char(fd.donation_date::timestamp, 'YYYY-MM')
      WHEN group_by = 'year' THEN to_char(fd.donation_date::timestamp, 'YYYY')
      ELSE to_char(fd.donation_date::timestamp, date_format)
    END AS time_period,
    SUM(fd.amount)::numeric AS total_amount,
    COUNT(*)::bigint AS donation_count,
    fd.currency,
    AVG(fd.amount)::numeric AS avg_amount,
    MIN(fd.amount)::numeric AS min_amount,
    MAX(fd.amount)::numeric AS max_amount
  FROM
    filtered_donations fd
  GROUP BY
    time_period, fd.currency
  ORDER BY
    time_period ASC, fd.currency ASC;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.get_donation_summary IS 'Generates donation summaries grouped by time period (day, week, month, year)';

-- Create donation_metadata table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.donation_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Add constraint for unique key per donation
  UNIQUE (donation_id, key)
);

-- Create index on donation_id for faster lookups
CREATE INDEX IF NOT EXISTS donation_metadata_donation_id_idx ON public.donation_metadata(donation_id);

-- Create index on key for filtering
CREATE INDEX IF NOT EXISTS donation_metadata_key_idx ON public.donation_metadata(key);

-- Enable RLS on donation_metadata
ALTER TABLE public.donation_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view metadata for their own donations
CREATE POLICY donation_metadata_select_own ON public.donation_metadata 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.donations 
      WHERE id = donation_metadata.donation_id AND donor_id = auth.uid()
    )
  );

-- Policy: Admins can view all donation metadata
CREATE POLICY donation_metadata_select_admin ON public.donation_metadata 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: System can insert donation metadata
CREATE POLICY donation_metadata_insert_system ON public.donation_metadata 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'system')
    )
  );

-- Comment on table and columns
COMMENT ON TABLE public.donation_metadata IS 'Stores metadata for donations as key-value pairs';
COMMENT ON COLUMN public.donation_metadata.key IS 'Metadata key';
COMMENT ON COLUMN public.donation_metadata.value IS 'Metadata value (can be JSON string)';

-- Create a view for donation reporting
CREATE OR REPLACE VIEW public.donation_reports AS
SELECT 
  d.id,
  d.donor_id,
  u.email AS donor_email,
  dp.full_name AS donor_name,
  d.amount,
  d.currency,
  d.payment_method,
  d.status,
  d.reference,
  d.transaction_id,
  d.donation_date,
  d.recurring,
  d.campaign_id,
  d.anonymous,
  d.notes,
  d.created_at,
  d.updated_at
FROM 
  public.donations d
LEFT JOIN 
  public.users u ON d.donor_id = u.id
LEFT JOIN 
  public.donor_profiles dp ON d.donor_id = dp.id;

-- Comment on view
COMMENT ON VIEW public.donation_reports IS 'View for generating donation reports with donor information';

-- Add RLS policy for the view
CREATE POLICY donation_reports_select_admin ON public.donation_reports
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add RLS policy for users to see their own donations
CREATE POLICY donation_reports_select_own ON public.donation_reports
  FOR SELECT 
  USING (donor_id = auth.uid());

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_donation_summary TO authenticated;
GRANT SELECT ON public.donation_reports TO authenticated;
