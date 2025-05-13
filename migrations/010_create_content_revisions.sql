-- Migration: 010_create_content_revisions
-- Description: Creates content_revisions table and adds revision_count to blog_posts and pages tables
-- Author: HopeCare Development Team
-- Date: 2025-04-18

-- Add revision_count column to blog_posts table
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 1;

-- Add revision_count column to pages table
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 1;

-- Create content_revisions table
CREATE TABLE IF NOT EXISTS content_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('blog_post', 'page')),
  content_id UUID NOT NULL,
  content JSONB NOT NULL,
  revision_number INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add constraints
  CONSTRAINT content_revisions_content_id_check CHECK (
    (content_type = 'blog_post' AND EXISTS (SELECT 1 FROM blog_posts WHERE id = content_id)) OR
    (content_type = 'page' AND EXISTS (SELECT 1 FROM pages WHERE id = content_id))
  ),
  CONSTRAINT content_revisions_revision_number_positive CHECK (revision_number > 0)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS content_revisions_content_type_content_id_idx
ON content_revisions(content_type, content_id);

CREATE INDEX IF NOT EXISTS content_revisions_created_by_idx
ON content_revisions(created_by);

-- Create system_settings table for application configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for content_revisions
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;

-- Admins can view, insert, update, and delete all content revisions
CREATE POLICY admin_all_content_revisions ON content_revisions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Users can view their own content revisions
CREATE POLICY user_select_own_content_revisions ON content_revisions
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Add RLS policies for system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view, insert, update, and delete all system settings
CREATE POLICY admin_all_system_settings ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- All authenticated users can view system settings
CREATE POLICY user_select_system_settings ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default system settings
INSERT INTO system_settings (key, value)
VALUES 
  ('site_name', '"HopeCare"'),
  ('site_description', '"Charitable Donation and Volunteer Management Platform"'),
  ('contact_email', '"contact@hopecaretz.org"'),
  ('donation_currency', '"USD"'),
  ('enable_volunteer_applications', 'true'),
  ('enable_donations', 'true'),
  ('enable_blog', 'true')
ON CONFLICT (key) DO NOTHING;

-- Add comment to tables for documentation
COMMENT ON TABLE content_revisions IS 'Stores revision history for blog posts and pages';
COMMENT ON TABLE system_settings IS 'Stores application-wide configuration settings';
