describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    cy.visit('/admin');
  });

  it('should display admin dashboard components', () => {
    cy.get('[data-cy="admin-sidebar"]').should('be.visible');
    cy.get('[data-cy="admin-header"]').should('be.visible');
    cy.get('[data-cy="admin-content"]').should('be.visible');
  });

  it('should navigate between dashboard sections', () => {
    // Content Management
    cy.get('[data-cy="nav-content"]').click();
    cy.url().should('include', '/admin/content');
    cy.get('[data-cy="content-list"]').should('be.visible');

    // Media Library
    cy.get('[data-cy="nav-media"]').click();
    cy.url().should('include', '/admin/media');
    cy.get('[data-cy="media-grid"]').should('be.visible');

    // User Management
    cy.get('[data-cy="nav-users"]').click();
    cy.url().should('include', '/admin/users');
    cy.get('[data-cy="users-table"]').should('be.visible');

    // Analytics
    cy.get('[data-cy="nav-analytics"]').click();
    cy.url().should('include', '/admin/analytics');
    cy.get('[data-cy="analytics-dashboard"]').should('be.visible');
  });

  it('should show quick stats on dashboard', () => {
    cy.get('[data-cy="total-users"]').should('be.visible');
    cy.get('[data-cy="total-donations"]').should('be.visible');
    cy.get('[data-cy="active-campaigns"]').should('be.visible');
    cy.get('[data-cy="monthly-revenue"]').should('be.visible');
  });

  it('should display recent activity feed', () => {
    cy.get('[data-cy="activity-feed"]').should('be.visible');
    cy.get('[data-cy="activity-item"]').should('have.length.at.least', 1);
  });

  it('should allow date range selection for analytics', () => {
    cy.get('[data-cy="nav-analytics"]').click();
    cy.get('[data-cy="date-range-picker"]').click();
    cy.get('[data-cy="date-range-30"]').click();
    cy.get('[data-cy="analytics-chart"]').should('be.visible');
  });

  it('should show system notifications', () => {
    cy.get('[data-cy="notifications-bell"]').click();
    cy.get('[data-cy="notifications-panel"]').should('be.visible');
    cy.get('[data-cy="notification-item"]').should('have.length.at.least', 1);
  });
});
