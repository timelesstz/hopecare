# HopeCare Firebase to Supabase Migration Plan

## Overview
This document outlines the step-by-step process for migrating the HopeCare application from Firebase to Supabase.

## Prerequisites
- Firebase Admin SDK credentials (already in .env)
- Supabase project (ID: tkxppievtqiipcsdqbpf)
- Supabase service role key (in .env)

## Migration Steps

### 1. User Authentication Migration

#### 1.1 Create Admin User
- Create admin user in Supabase Auth (admin@hopecaretz.org)
- Create corresponding record in public.users table
- Create admin profile in admin_profiles table

#### 1.2 Migrate Regular Users
- Export all users from Firebase Auth
- Import users to Supabase Auth
- Create corresponding records in public.users table
- Create role-specific profile records (donor_profiles, volunteer_profiles)

### 2. Database Migration

#### 2.1 Content Migration
- Migrate blog_posts collection from Firebase to Supabase
- Migrate pages collection from Firebase to Supabase
- Migrate donations collection from Firebase to Supabase
- Migrate opportunities collection from Firebase to Supabase

#### 2.2 Storage Migration
- Migrate media files from Firebase Storage to Supabase Storage
- Update references in database records

### 3. Application Updates

#### 3.1 Authentication Updates
- Update authentication context to use Supabase Auth
- Update protected routes to work with Supabase Auth
- Update user profile management

#### 3.2 Data Access Updates
- Replace Firebase queries with Supabase queries
- Update real-time listeners
- Implement proper error handling

#### 3.3 Storage Updates
- Update file upload/download functions to use Supabase Storage

### 4. Testing

#### 4.1 Authentication Testing
- Test user registration
- Test user login
- Test password reset
- Test role-based access control

#### 4.2 Data Access Testing
- Test CRUD operations for all content types
- Test real-time updates
- Test query performance

#### 4.3 End-to-End Testing
- Test complete user journeys
- Test admin functionality
- Test donor functionality
- Test volunteer functionality

### 5. Deployment

#### 5.1 Staging Deployment
- Deploy to staging environment
- Perform final testing

#### 5.2 Production Deployment
- Deploy to production
- Monitor for issues

## Migration Scripts

The following scripts will be created to automate the migration process:

1. `create-admin-user.js` - Create admin user in Supabase
2. `migrate-users.js` - Migrate users from Firebase to Supabase
3. `migrate-content.js` - Migrate content collections
4. `migrate-storage.js` - Migrate storage files
5. `verify-migration.js` - Verify migration success

## Rollback Plan

In case of migration issues, the following rollback steps will be implemented:

1. Revert application code to use Firebase
2. Keep Supabase data as backup
3. Document lessons learned for future migration attempts
