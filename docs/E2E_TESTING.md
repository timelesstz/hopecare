# End-to-End Testing Documentation

This document provides a comprehensive guide to the end-to-end testing implementation for the HopeCare application after the Supabase migration.

## Overview

The end-to-end testing framework uses Cypress to validate the complete user flows and functionality of the HopeCare application. These tests ensure that all critical features work correctly with the Supabase backend, verifying the success of the Firebase to Supabase migration.

## Test Structure

The end-to-end tests are organized into three main categories:

1. **Authentication Tests** (`cypress/e2e/auth.cy.js`)
   - Login functionality
   - Logout functionality
   - Error handling for invalid credentials
   - Authentication state persistence

2. **Content Management Tests** (`cypress/e2e/content-management.cy.js`)
   - Blog post creation, editing, and deletion
   - Page creation, editing, and deletion
   - Content navigation
   - Content revision history and restoration

3. **Donation Management Tests** (`cypress/e2e/donation-management.cy.js`)
   - Donation listing and filtering
   - Donation creation
   - Donation analytics
   - Report generation and export

## Running the Tests

### Prerequisites

Before running the tests, ensure you have:

1. Node.js and npm installed
2. Cypress installed (`npm install cypress --save-dev`)
3. A running instance of the HopeCare application
4. Proper Supabase credentials configured in `cypress.env.json`

### Configuration

The Cypress configuration is stored in `cypress.config.js` and includes:

- Base URL for the application
- Viewport settings
- Default command timeout
- Screenshot and video settings

Environment variables are stored in `cypress.env.json`:

```json
{
  "supabaseUrl": "https://your-project-id.supabase.co",
  "supabaseAnonKey": "your-anon-key"
}
```

### Running Tests

To run the tests, use the following npm scripts:

```bash
# Open Cypress UI for interactive testing
npm run cypress:open

# Run all tests headlessly
npm run test:e2e

# Run specific test suites
npm run test:e2e:auth
npm run test:e2e:content
npm run test:e2e:donations
```

## Custom Commands

The testing framework includes several custom commands to simplify test writing:

1. **Authentication Commands**
   - `cy.supabaseLogin(email, password)` - Logs in directly via the Supabase API

2. **Data Creation Commands**
   - `cy.createTestBlogPost(title, content)` - Creates a test blog post
   - `cy.createTestPage(title, content, template)` - Creates a test page

3. **Data Cleanup Commands**
   - `cy.cleanupTestData(pattern)` - Removes test data matching a pattern

## Test Data

The tests use the following test accounts:

- Admin: admin@hopecaretz.org / Hope@admin2

## Best Practices

When writing or modifying tests:

1. Use data attributes (`data-cy="..."`) for selecting elements
2. Create test data programmatically via API calls when possible
3. Clean up test data after tests complete
4. Use custom commands for repetitive operations
5. Keep tests independent and isolated

## Continuous Integration

The end-to-end tests are integrated into the CI/CD pipeline and run automatically:

- On pull requests to the main branch
- Before deployment to production
- Nightly on the development environment

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**
   - Check that the Supabase credentials are correct
   - Verify that the test user exists in the database

2. **Element Not Found Errors**
   - Ensure data-cy attributes are correctly implemented
   - Check if the application structure has changed

3. **Timeout Errors**
   - Increase the timeout in the Cypress configuration
   - Check for performance issues in the application

## Future Improvements

Planned enhancements to the testing framework:

1. Expand test coverage to volunteer management features
2. Add visual regression testing
3. Implement API mocking for faster tests
4. Add accessibility testing

## References

- [Cypress Documentation](https://docs.cypress.io)
- [Supabase Documentation](https://supabase.io/docs)
- [Testing Best Practices](https://docs.cypress.io/guides/references/best-practices)
