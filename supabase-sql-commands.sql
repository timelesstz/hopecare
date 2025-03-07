-- Run these commands in the Supabase SQL Editor

-- 1. First, create the user in the auth.users table (this is handled by Supabase Auth UI)
-- You'll need to create the user through the Authentication > Users section in the Supabase dashboard
-- Email: john.doe@example.com
-- Password: Donor2024!

-- 2. After creating the user in the Authentication section, get the user's UUID
-- Then run these commands, replacing 'USER_UUID' with the actual UUID from the first step

-- Create user profile in the users table
INSERT INTO public.users (id, email, name, role, status, created_at, updated_at)
VALUES 
  ('USER_UUID', 'john.doe@example.com', 'John Doe', 'DONOR', 'ACTIVE', NOW(), NOW());

-- Create donor profile
INSERT INTO public.donor_profiles (id, first_name, last_name, email, phone, status, preferences)
VALUES 
  ('USER_UUID', 'John', 'Doe', 'john.doe@example.com', '+1234567890', 'active', 
   '{"interests": ["education", "health"], "preferredCommunication": "email"}'::jsonb);

-- Verify the user was created
SELECT * FROM auth.users WHERE email = 'john.doe@example.com';
SELECT * FROM public.users WHERE email = 'john.doe@example.com';
SELECT * FROM public.donor_profiles WHERE email = 'john.doe@example.com'; 