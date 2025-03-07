-- Get overall donation statistics
CREATE OR REPLACE FUNCTION get_donation_stats()
RETURNS TABLE (
  total_donations BIGINT,
  total_amount DECIMAL,
  successful_donations BIGINT,
  average_amount DECIMAL,
  unique_donors BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_donations,
    COALESCE(SUM(amount), 0)::DECIMAL as total_amount,
    COUNT(CASE WHEN status = 'successful' THEN 1 END)::BIGINT as successful_donations,
    COALESCE(AVG(amount), 0)::DECIMAL as average_amount,
    COUNT(DISTINCT user_id)::BIGINT as unique_donors
  FROM transactions
  WHERE status != 'failed';
END;
$$;

-- Get monthly donation statistics for the current year
CREATE OR REPLACE FUNCTION get_monthly_donation_stats()
RETURNS TABLE (
  month DATE,
  total_amount DECIMAL,
  donation_count BIGINT,
  unique_donors BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT generate_series(
      date_trunc('year', CURRENT_DATE),
      date_trunc('month', CURRENT_DATE),
      '1 month'::interval
    ) as month
  )
  SELECT 
    months.month::DATE,
    COALESCE(SUM(t.amount), 0)::DECIMAL as total_amount,
    COUNT(t.transaction_id)::BIGINT as donation_count,
    COUNT(DISTINCT t.user_id)::BIGINT as unique_donors
  FROM months
  LEFT JOIN transactions t ON 
    date_trunc('month', t.created_at) = months.month
    AND t.status = 'successful'
  GROUP BY months.month
  ORDER BY months.month;
END;
$$;

-- Get donor ranking statistics
CREATE OR REPLACE FUNCTION get_donor_rankings(
  time_period TEXT DEFAULT 'all_time'
)
RETURNS TABLE (
  user_id UUID,
  total_amount DECIMAL,
  donation_count BIGINT,
  rank BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_transactions AS (
    SELECT *
    FROM transactions
    WHERE 
      status = 'successful'
      AND CASE 
        WHEN time_period = 'this_month' THEN
          date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
        WHEN time_period = 'this_year' THEN
          date_trunc('year', created_at) = date_trunc('year', CURRENT_DATE)
        ELSE TRUE
      END
  )
  SELECT 
    t.user_id,
    SUM(t.amount)::DECIMAL as total_amount,
    COUNT(*)::BIGINT as donation_count,
    RANK() OVER (ORDER BY SUM(t.amount) DESC)::BIGINT as rank
  FROM filtered_transactions t
  GROUP BY t.user_id
  ORDER BY total_amount DESC;
END;
$$; 