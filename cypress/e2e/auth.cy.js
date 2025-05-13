describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('form').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Check for error message
    cy.get('[data-cy="auth-error"]').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[type="email"]').type('admin@hopecaretz.org');
    cy.get('input[type="password"]').type('Hope@admin2');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard after successful login
    cy.url().should('include', '/admin');
    
    // Check if user is logged in
    cy.get('[data-cy="user-menu"]').should('be.visible');
  });

  it('should logout successfully', () => {
    // Login first
    cy.get('input[type="email"]').type('admin@hopecaretz.org');
    cy.get('input[type="password"]').type('Hope@admin2');
    cy.get('button[type="submit"]').click();
    
    // Wait for login to complete
    cy.url().should('include', '/admin');
    
    // Logout
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="logout-button"]').click();
    
    // Should redirect to login page
    cy.url().should('include', '/login');
  });
});
