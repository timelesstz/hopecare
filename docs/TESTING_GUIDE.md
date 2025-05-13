# HopeCare Testing Guide

This guide provides comprehensive instructions for testing the HopeCare application after the Supabase migration.

## Testing Overview

The HopeCare testing strategy consists of multiple layers to ensure complete coverage of the application:

1. **Unit Tests** - Test individual components and functions
2. **Integration Tests** - Test interactions between components
3. **Service Tests** - Test Supabase service implementations
4. **End-to-End Tests** - Test complete user flows

## Prerequisites

Before running tests, ensure you have:

1. Node.js and npm installed
2. Access to a Supabase project for testing
3. Environment variables configured in `.env` file
4. All dependencies installed (`npm install`)

## Environment Setup

Create a `.env` file with the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For Cypress tests, create a `cypress.env.json` file:

```json
{
  "supabaseUrl": "https://your-project-id.supabase.co",
  "supabaseAnonKey": "your-anon-key"
}
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm run test -- -t "component-name"
```

### Supabase Service Tests

These tests validate the Supabase service implementations:

```bash
node scripts/test-supabase-services.js
```

This script tests:
- User authentication and management
- Donor profile operations
- Volunteer profile operations
- Content management (pages and blog posts)
- Donation processing and tracking

### Feature Tests

These tests validate that all features work correctly with Supabase:

```bash
node scripts/test-features.js
```

This script tests:
- User registration and login
- Content creation and management
- Donation processing
- Volunteer management
- Admin operations

### End-to-End Tests

End-to-end tests use Cypress to validate complete user flows:

```bash
# Open Cypress UI for interactive testing
npm run cypress:open

# Run all end-to-end tests headlessly
npm run test:e2e

# Run specific test suites
npm run test:e2e:auth
npm run test:e2e:content
npm run test:e2e:donations
```

## Security Testing

The security audit script validates security configurations:

```bash
node scripts/security-audit.js
```

This script checks:
- Row Level Security (RLS) policies
- Authentication rules
- API endpoint security
- Data validation

## Troubleshooting Common Issues

### Authentication Issues

If tests fail with authentication errors:

1. Verify Supabase credentials in `.env` and `cypress.env.json`
2. Check that test users exist in the Supabase auth.users table
3. Verify RLS policies allow test operations

### Database Connection Issues

If tests fail with database connection errors:

1. Check Supabase URL and API key
2. Verify network connectivity to Supabase
3. Check Supabase service status

### Test Data Issues

If tests fail due to missing or incorrect data:

1. Run the seed scripts to create test data:
   ```bash
   npm run seed:accounts
   npm run seed:sample-users
   ```
2. Check that the database schema matches expected structure

## Continuous Integration

The test suite is integrated with CI/CD pipelines:

1. All tests run on pull requests to main branch
2. End-to-end tests run before deployment
3. Security audit runs daily on the production environment

## Test Accounts

The following test accounts are available for testing:

- Admin: admin@hopecaretz.org / Hope@admin2
- Donor: donor@example.com / donor123
- Volunteer: volunteer@example.com / volunteer123

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Cypress Documentation](https://docs.cypress.io)
- [Vitest Documentation](https://vitest.dev/)
