// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Supabase authentication command
Cypress.Commands.add('supabaseLogin', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('supabaseUrl')}/auth/v1/token?grant_type=password`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': Cypress.env('supabaseAnonKey'),
    },
    body: {
      email,
      password,
    },
  }).then((response) => {
    // Store the access token and refresh token
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: response.body.access_token,
      refresh_token: response.body.refresh_token,
      expires_at: Date.now() + response.body.expires_in * 1000,
    }));
  });
});

// Command to create a test blog post directly via the API
Cypress.Commands.add('createTestBlogPost', (title, content) => {
  const authToken = JSON.parse(localStorage.getItem('supabase.auth.token')).access_token;
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('supabaseUrl')}/rest/v1/blog_posts`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': Cypress.env('supabaseAnonKey'),
      'Authorization': `Bearer ${authToken}`,
    },
    body: {
      title,
      content,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      status: 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
});

// Command to create a test page directly via the API
Cypress.Commands.add('createTestPage', (title, content, template = 'DEFAULT') => {
  const authToken = JSON.parse(localStorage.getItem('supabase.auth.token')).access_token;
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('supabaseUrl')}/rest/v1/pages`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': Cypress.env('supabaseAnonKey'),
      'Authorization': `Bearer ${authToken}`,
    },
    body: {
      title,
      content,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      template,
      status: 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
});

// Command to clean up test data
Cypress.Commands.add('cleanupTestData', (pattern) => {
  const authToken = JSON.parse(localStorage.getItem('supabase.auth.token')).access_token;
  
  // Clean up test blog posts
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('supabaseUrl')}/rest/v1/blog_posts`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': Cypress.env('supabaseAnonKey'),
      'Authorization': `Bearer ${authToken}`,
    },
    qs: {
      title: `ilike.${pattern}%`,
    },
  });
  
  // Clean up test pages
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('supabaseUrl')}/rest/v1/pages`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': Cypress.env('supabaseAnonKey'),
      'Authorization': `Bearer ${authToken}`,
    },
    qs: {
      title: `ilike.${pattern}%`,
    },
  });
});
