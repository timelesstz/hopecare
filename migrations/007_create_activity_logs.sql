-- Migration: Create Activity Logs Table
-- Description: This migration creates the activity_logs table for tracking user activities

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Add indexes for better performance
    CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);

-- Create index on action for filtering
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON public.activity_logs(action);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at);

-- Add RLS policies

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own activity logs
CREATE POLICY activity_logs_select_own ON public.activity_logs 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy: Users can create their own activity logs
CREATE POLICY activity_logs_insert_own ON public.activity_logs 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all activity logs
CREATE POLICY activity_logs_select_admin ON public.activity_logs 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can insert activity logs for any user
CREATE POLICY activity_logs_insert_admin ON public.activity_logs 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create email_verification_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS email_verification_tokens_token_idx ON public.email_verification_tokens(token);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS email_verification_tokens_user_id_idx ON public.email_verification_tokens(user_id);

-- Enable RLS on email_verification_tokens
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins and the service role can access email verification tokens
CREATE POLICY email_verification_tokens_admin ON public.email_verification_tokens 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create role_permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL,
    permissions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on role for faster lookups
CREATE INDEX IF NOT EXISTS role_permissions_role_idx ON public.role_permissions(role);

-- Enable RLS on role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read role permissions
CREATE POLICY role_permissions_select ON public.role_permissions 
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Policy: Only admins can modify role permissions
CREATE POLICY role_permissions_all_admin ON public.role_permissions 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add two_factor_secret and two_factor_enabled columns to users table if they don't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permissions)
VALUES 
    ('admin', '[{"name": "manage_users"}, {"name": "manage_content"}, {"name": "manage_donations"}, {"name": "manage_volunteers"}, {"name": "view_reports"}, {"name": "manage_settings"}]'),
    ('donor', '[{"name": "manage_own_profile"}, {"name": "view_own_donations"}, {"name": "make_donations"}]'),
    ('volunteer', '[{"name": "manage_own_profile"}, {"name": "view_opportunities"}, {"name": "apply_opportunities"}, {"name": "log_hours"}]')
ON CONFLICT (role) DO NOTHING;

-- Comment on tables and columns
COMMENT ON TABLE public.activity_logs IS 'Tracks user activities across the application';
COMMENT ON COLUMN public.activity_logs.action IS 'The action performed (e.g., login, profile_update)';
COMMENT ON COLUMN public.activity_logs.entity_type IS 'Type of entity affected (e.g., donation, profile)';
COMMENT ON COLUMN public.activity_logs.entity_id IS 'ID of the entity affected';
COMMENT ON COLUMN public.activity_logs.metadata IS 'Additional information about the activity';

COMMENT ON TABLE public.email_verification_tokens IS 'Stores tokens for email verification';
COMMENT ON COLUMN public.email_verification_tokens.token IS 'Unique token sent to user email';
COMMENT ON COLUMN public.email_verification_tokens.used IS 'Whether the token has been used';
COMMENT ON COLUMN public.email_verification_tokens.expires_at IS 'When the token expires';

COMMENT ON TABLE public.role_permissions IS 'Defines permissions for each role';
COMMENT ON COLUMN public.role_permissions.role IS 'Role name (admin, donor, volunteer)';
COMMENT ON COLUMN public.role_permissions.permissions IS 'Array of permission objects';
