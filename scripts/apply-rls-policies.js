// @ts-check
// package.json: { "type": "module" }

/**
 * Apply RLS Policies Script for HopeCare Supabase Migration
 * 
 * This script applies the updated RLS policies to the Supabase project
 * to fix issues with service role access and user registration.
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tkxppievtqiipcsdqbpf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(chalk.red('Error: Supabase URL or service key not found in environment variables.'));
  console.error(chalk.gray(`VITE_SUPABASE_URL: ${supabaseUrl ? 'Found' : 'Not found'}`));
  console.error(chalk.gray(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'Found' : 'Not found'}`));
  process.exit(1);
}

// Initialize Supabase admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log(chalk.blue('=== Applying RLS Policies to Supabase Project ==='));
console.log(chalk.gray(`Supabase URL: ${supabaseUrl}`));

// RLS policies to apply
const policies = [
  // Users table policies
  {
    name: 'Enable RLS on users table',
    sql: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;'
  },
  {
    name: 'Create users_select_own policy',
    sql: `
      DROP POLICY IF EXISTS users_select_own ON public.users;
      CREATE POLICY users_select_own ON public.users
        FOR SELECT USING (auth.uid() = id);
    `
  },
  {
    name: 'Create users_update_own policy',
    sql: `
      DROP POLICY IF EXISTS users_update_own ON public.users;
      CREATE POLICY users_update_own ON public.users
        FOR UPDATE USING (auth.uid() = id);
    `
  },
  {
    name: 'Create users_select_admin policy',
    sql: `
      DROP POLICY IF EXISTS users_select_admin ON public.users;
      CREATE POLICY users_select_admin ON public.users
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'ADMIN'
          )
        );
    `
  },
  {
    name: 'Create users_update_admin policy',
    sql: `
      DROP POLICY IF EXISTS users_update_admin ON public.users;
      CREATE POLICY users_update_admin ON public.users
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'ADMIN'
          )
        );
    `
  },
  {
    name: 'Create users_insert_admin policy',
    sql: `
      DROP POLICY IF EXISTS users_insert_admin ON public.users;
      CREATE POLICY users_insert_admin ON public.users
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'ADMIN'
          )
        );
    `
  },
  {
    name: 'Create users_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS users_insert_service_role ON public.users;
      CREATE POLICY users_insert_service_role ON public.users
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Donor profiles policies
  {
    name: 'Create donor_profiles_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS donor_profiles_insert_service_role ON public.donor_profiles;
      CREATE POLICY donor_profiles_insert_service_role ON public.donor_profiles
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Volunteer profiles policies
  {
    name: 'Create volunteer_profiles_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS volunteer_profiles_insert_service_role ON public.volunteer_profiles;
      CREATE POLICY volunteer_profiles_insert_service_role ON public.volunteer_profiles
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Admin profiles policies
  {
    name: 'Create admin_profiles_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS admin_profiles_insert_service_role ON public.admin_profiles;
      CREATE POLICY admin_profiles_insert_service_role ON public.admin_profiles
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Blog posts policies
  {
    name: 'Create blog_posts_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS blog_posts_insert_service_role ON public.blog_posts;
      CREATE POLICY blog_posts_insert_service_role ON public.blog_posts
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Pages policies
  {
    name: 'Create pages_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS pages_insert_service_role ON public.pages;
      CREATE POLICY pages_insert_service_role ON public.pages
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Donations policies
  {
    name: 'Create donations_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS donations_insert_service_role ON public.donations;
      CREATE POLICY donations_insert_service_role ON public.donations
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Volunteer opportunities policies
  {
    name: 'Create volunteer_opportunities_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS volunteer_opportunities_insert_service_role ON public.volunteer_opportunities;
      CREATE POLICY volunteer_opportunities_insert_service_role ON public.volunteer_opportunities
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Volunteer applications policies
  {
    name: 'Create volunteer_applications_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS volunteer_applications_insert_service_role ON public.volunteer_applications;
      CREATE POLICY volunteer_applications_insert_service_role ON public.volunteer_applications
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Content revisions policies
  {
    name: 'Create content_revisions_insert_service_role policy',
    sql: `
      DROP POLICY IF EXISTS content_revisions_insert_service_role ON public.content_revisions;
      CREATE POLICY content_revisions_insert_service_role ON public.content_revisions
        FOR INSERT WITH CHECK (true);
    `
  },
  
  // Helper functions
  {
    name: 'Create is_service_role helper function',
    sql: `
      CREATE OR REPLACE FUNCTION is_service_role()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  },
  
  {
    name: 'Create is_admin helper function',
    sql: `
      CREATE OR REPLACE FUNCTION is_admin()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid() AND users.role = 'ADMIN'
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  }
];

// Apply each policy
async function applyPolicies() {
  console.log(chalk.blue(`Applying ${policies.length} RLS policies...`));
  
  for (const policy of policies) {
    try {
      console.log(chalk.blue(`Applying policy: ${policy.name}`));
      
      const { error } = await supabaseAdmin.rpc('pgexec', { query: policy.sql });
      
      if (error) {
        console.error(chalk.red(`Error applying policy: ${policy.name}`));
        console.error(chalk.red(`Error details: ${error.message}`));
      } else {
        console.log(chalk.green(`✓ Successfully applied policy: ${policy.name}`));
      }
    } catch (err) {
      console.error(chalk.red(`Error applying policy: ${policy.name}`));
      console.error(chalk.red(`Error details: ${err.message}`));
    }
  }
  
  console.log(chalk.blue('\n=== RLS Policy Application Complete ==='));
}

// Run the policy application
applyPolicies().catch(err => {
  console.error(chalk.red(`Error: ${err.message}`));
  process.exit(1);
});
