CREATE TABLE IF NOT EXISTS api_configs (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'password', 'email', 'number', 'boolean')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('smtp', 'api', 'general', 'contact')),
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_api_configs_key ON api_configs(key);
CREATE INDEX idx_api_configs_category ON api_configs(category);

-- Insert default configurations
INSERT INTO api_configs (key, value, description, type, category, is_sensitive) VALUES
-- SMTP Configuration
('SMTP_HOST', 'smtp.gmail.com', 'SMTP server hostname', 'text', 'smtp', false),
('SMTP_PORT', '587', 'SMTP server port', 'number', 'smtp', false),
('SMTP_USER', '', 'SMTP username/email', 'email', 'smtp', true),
('SMTP_PASS', '', 'SMTP password', 'password', 'smtp', true),
('SMTP_FROM', 'HopeCare Tanzania <no-reply@hopecaretz.org>', 'From email address', 'text', 'smtp', false),

-- Contact Form Configuration
('ADMIN_EMAIL', 'admin@hopecaretz.org', 'Admin email for notifications', 'email', 'contact', false),
('CONTACT_FORM_ENABLED', 'true', 'Enable/disable contact form', 'boolean', 'contact', false),
('MAX_MESSAGE_LENGTH', '1000', 'Maximum message length in contact form', 'number', 'contact', false),

-- General Configuration
('SITE_NAME', 'HopeCare Tanzania', 'Website name', 'text', 'general', false),
('ORGANIZATION_ADDRESS', 'New Safari Hotel, 402, Boma Road, Arusha-Tanzania', 'Organization address', 'text', 'general', false),
('PHONE_NUMBER', '+255 (0) 27 2509720', 'Primary phone number', 'text', 'general', false),
('MOBILE_NUMBER', '+255 769 297925', 'Mobile phone number', 'text', 'general', false)

ON CONFLICT (key) DO NOTHING;
