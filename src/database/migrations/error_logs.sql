-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    metadata JSONB,
    user_id UUID REFERENCES users(id),
    severity VARCHAR(20) NOT NULL,
    environment VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_error_logs_type ON error_logs(type);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_environment ON error_logs(environment);
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);

-- Create function to clean up old logs
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete logs older than 30 days
    DELETE FROM error_logs
    WHERE timestamp < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a scheduled job to clean up old logs
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule('0 0 * * *', $$
    SELECT cleanup_old_error_logs();
$$); 