# HopeCare Supabase Migration Guide

## Overview

This guide provides step-by-step instructions for completing the migration from Firebase to Supabase for the HopeCare application. It covers the following key areas:

1. Applying RLS policies
2. Updating the user registration flow
3. Running tests to validate the migration
4. Preparing for production deployment

## Prerequisites

Before proceeding with the migration, ensure you have:

1. Access to the Supabase project dashboard
2. The necessary environment variables set up in your `.env` file:
   ```
   VITE_SUPABASE_URL=https://tkxppievtqiipcsdqbpf.supabase.co
   VITE_SUPABASE_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   ```
3. Admin credentials for the Supabase project:
   - Email: admin@hopecaretz.org
   - Password: Hope@admin2

## 1. Applying RLS Policies

Row Level Security (RLS) policies control access to tables in Supabase. The current policies need to be updated to properly handle service role access and fix user registration issues.

### Steps:

1. Log in to the [Supabase Dashboard](https://app.supabase.com)
2. Select the HopeCare project
3. Navigate to the SQL Editor
4. Copy the contents of `scripts/update-rls-policies.sql` into the SQL Editor
5. Run the SQL script to update the RLS policies

Alternatively, you can apply the migrations one by one:

1. Navigate to the "Authentication" section in the Supabase dashboard
2. Go to "Policies"
3. For each table, add the policies as defined in the SQL script

## 2. Updating User Registration Flow

The user registration flow needs to be updated to handle Supabase's two-step process:
1. Create user in `auth.users`
2. Create user profile in `public.users`

### Steps:

1. Replace Firebase authentication with Supabase authentication:
   - Use the new `supabaseAuthService.ts` file for authentication operations
   - Update components that use Firebase authentication to use Supabase instead

2. Update the authentication context:
   - Replace `FirebaseAuthContext.tsx` with a Supabase-based authentication context
   - Ensure the context handles the two-step user registration process

3. Update user profile management:
   - Ensure user profiles are properly created in `public.users` after authentication
   - Update profile management to use Supabase queries

## 3. Running Tests to Validate Migration

Run the test suites to validate the Supabase migration:

```bash
# Test Supabase connection
npm run test:supabase-connection

# Test authentication
npm run test:supabase-auth

# Test database access
npm run test:supabase-database

# Test features
npm run test:features

# Run end-to-end tests
npm run test:e2e
```

### Troubleshooting Common Issues:

1. **RLS Policy Issues**:
   - If you encounter "permission denied" or "violates row-level security policy" errors, review and update the RLS policies as needed.
   - Ensure the service role key is being used correctly for administrative operations.

2. **Authentication Issues**:
   - Verify that the user registration process correctly creates users in both `auth.users` and `public.users`.
   - Check that the foreign key constraints between `auth.users` and `public.users` are properly maintained.

3. **Database Schema Issues**:
   - Ensure all tables have the correct structure and relationships.
   - Verify that foreign key constraints are properly defined.

## 4. Preparing for Production Deployment

Before deploying to production, complete the following steps:

1. **Final Testing**:
   - Run all test suites to ensure everything is working correctly
   - Perform manual testing of critical features

2. **Environment Configuration**:
   - Update production environment variables
   - Ensure secrets are properly managed

3. **Database Backup**:
   - Create a backup of the Firebase data
   - Verify the Supabase database has all the required data

4. **Deployment Checklist**:
   - Update deployment scripts
   - Configure CI/CD pipelines
   - Set up monitoring and logging

5. **Post-Deployment Verification**:
   - Verify authentication flows
   - Check database access
   - Validate critical features

## Database Structure

The Supabase database has the following structure:

1. **Authentication**:
   - Users are created in `auth.users` table first
   - The `public.users` table has a foreign key constraint (`users_id_fkey`) that references `auth.users(id)`

2. **Database Tables**:
   - `public.users`: Contains basic user information (id, email, display_name, role, created_at, updated_at)
   - `public.admin_profiles`: Contains admin-specific data (id, full_name, position, department, access_level, last_login, created_at, updated_at)
   - `public.donor_profiles`: Contains donor-specific data
   - `public.volunteer_profiles`: Contains volunteer-specific data
   - `public.donations`: Contains donation data
   - `public.blog_posts`: Contains blog post content
   - `public.pages`: Contains page content
   - `public.volunteer_opportunities`: Contains volunteer opportunity data
   - `public.volunteer_applications`: Contains volunteer application data
   - `public.content_revisions`: Contains content revision history

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Supabase Migration Test Report](./SUPABASE_MIGRATION_TEST_REPORT.md)
