describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to login page', () => {
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/login');
  });

  it('should show validation errors for empty form submission', () => {
    cy.visit('/login');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="email-error"]').should('be.visible');
    cy.get('[data-cy="password-error"]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('invalid@email.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="login-error"]').should('be.visible');
  });

  it('should successfully log in with valid credentials', () => {
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('[data-cy="password-input"]').type(Cypress.env('TEST_USER_PASSWORD'));
    cy.get('[data-cy="login-submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="user-menu"]').should('be.visible');
  });

  it('should successfully log out', () => {
    // First log in
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'));
    
    // Then test logout
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('equal', Cypress.config().baseUrl + '/');
    cy.get('[data-cy="login-button"]').should('be.visible');
  });
});
