describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('Homepage should match visual snapshot', () => {
    cy.visit('/');
    cy.get('[data-cy="main-nav"]').should('be.visible');
    cy.matchImageSnapshot('homepage');
  });

  it('Donation page should match visual snapshot', () => {
    cy.visit('/donate');
    cy.get('[data-cy="donation-progress-container"]').should('be.visible');
    cy.matchImageSnapshot('donation-page');
  });

  it('Admin dashboard should match visual snapshot', () => {
    cy.login('admin@example.com', 'password');
    cy.visit('/admin/dashboard');
    cy.get('[data-cy="admin-dashboard"]').should('be.visible');
    cy.matchImageSnapshot('admin-dashboard');
  });

  it('Media library should match visual snapshot', () => {
    cy.login('admin@example.com', 'password');
    cy.visit('/admin/media');
    cy.get('[data-cy="media-library"]').should('be.visible');
    cy.matchImageSnapshot('media-library');
  });

  it('User profile should match visual snapshot', () => {
    cy.login('user@example.com', 'password');
    cy.visit('/profile');
    cy.get('[data-cy="user-profile"]').should('be.visible');
    cy.matchImageSnapshot('user-profile');
  });

  it('Mobile navigation should match visual snapshot', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('[data-cy="mobile-menu-button"]').click();
    cy.get('[data-cy="mobile-menu"]').should('be.visible');
    cy.matchImageSnapshot('mobile-navigation');
  });

  it('Donation form should match visual snapshot', () => {
    cy.visit('/donate');
    cy.get('[data-cy="donation-form"]').should('be.visible');
    cy.matchImageSnapshot('donation-form');
  });

  it('Error pages should match visual snapshot', () => {
    cy.visit('/404');
    cy.matchImageSnapshot('404-page');
  });
});
