# HopeCare Testing Guide

This document provides instructions for setting up and running tests for the HopeCare application after migrating from Firebase to Supabase.

## Environment Setup

### 1. Create a Test Environment File

Create a `.env.test` file in the root directory with the following variables:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Admin Test User (should exist in your database)
TEST_ADMIN_EMAIL=admin@hopecaretz.org
TEST_ADMIN_PASSWORD=Hope@admin2
```

Replace the placeholder values with your actual Supabase project details.

### 2. Running Tests

#### Content Management System Tests

To test the CMS implementation:

```bash
# Using the test environment
NODE_ENV=test node scripts/test-cms-implementation.js

# Or using the default environment
node scripts/test-cms-implementation.js
```

#### Supabase Services Tests

To test all Supabase services:

```bash
node scripts/test-supabase-services.js
```

You can modify the `config.tests` object in the script to enable/disable specific test suites.

## Test Coverage

The test scripts validate the following functionality:

### Content Management System
- Blog post CRUD operations
- Page CRUD operations
- Content revisions
- Content filtering and search
- Slug generation and validation

### Supabase Services
- User authentication and management
- Donor profiles and donations
- Volunteer profiles and activities
- Content management
- Admin functionality

## Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   - Ensure your `.env` or `.env.test` file contains all required variables
   - Check that the dotenv package is correctly loading your environment file

2. **Authentication Failures**
   - Verify that the test admin user exists in your Supabase auth system
   - Check that the user has the correct permissions

3. **Database Access Issues**
   - Ensure your Supabase service key has the necessary permissions
   - Verify that Row Level Security (RLS) policies are correctly configured

4. **Test Data Cleanup Failures**
   - If tests fail and don't clean up properly, you may need to manually delete test data
   - Use the Supabase dashboard to identify and remove orphaned test records

## Adding New Tests

When adding new functionality to the application, follow these guidelines for creating tests:

1. Create a dedicated test function for each feature area
2. Include setup, verification, and cleanup steps
3. Use descriptive console output with the chalk package for readability
4. Handle errors gracefully and clean up test data even when tests fail
5. Document any special requirements or dependencies for the tests

## Continuous Integration

For CI/CD pipelines, you can run these tests automatically by:

1. Setting up environment variables in your CI system
2. Adding a test command to your package.json:
   ```json
   "scripts": {
     "test:cms": "NODE_ENV=test node scripts/test-cms-implementation.js",
     "test:services": "NODE_ENV=test node scripts/test-supabase-services.js"
   }
   ```
3. Running `npm run test:cms` and `npm run test:services` in your CI workflow
