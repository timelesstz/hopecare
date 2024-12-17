describe('User Profile Management', () => {
  beforeEach(() => {
    cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'));
    cy.visit('/profile');
  });

  it('should display user profile information', () => {
    cy.get('[data-cy="profile-name"]').should('be.visible');
    cy.get('[data-cy="profile-email"]').should('be.visible');
    cy.get('[data-cy="profile-role"]').should('be.visible');
  });

  it('should update profile information', () => {
    cy.get('[data-cy="edit-profile"]').click();
    cy.get('[data-cy="profile-name-input"]').clear().type('Updated Name');
    cy.get('[data-cy="profile-phone-input"]').clear().type('1234567890');
    cy.get('[data-cy="save-profile"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
    cy.get('[data-cy="profile-name"]').should('contain', 'Updated Name');
  });

  it('should update profile picture', () => {
    cy.get('[data-cy="edit-profile-picture"]').click();
    cy.get('[data-cy="profile-picture-upload"]').selectFile('cypress/fixtures/avatar.jpg');
    cy.get('[data-cy="save-profile-picture"]').click();
    cy.get('[data-cy="profile-picture"]').should('have.attr', 'src').and('include', 'avatar');
  });

  it('should change password', () => {
    cy.get('[data-cy="security-settings"]').click();
    cy.get('[data-cy="current-password"]').type(Cypress.env('TEST_USER_PASSWORD'));
    cy.get('[data-cy="new-password"]').type('NewPassword123!');
    cy.get('[data-cy="confirm-password"]').type('NewPassword123!');
    cy.get('[data-cy="update-password"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should manage notification preferences', () => {
    cy.get('[data-cy="notification-settings"]').click();
    cy.get('[data-cy="email-notifications"]').click();
    cy.get('[data-cy="push-notifications"]').click();
    cy.get('[data-cy="save-notifications"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should display activity history', () => {
    cy.get('[data-cy="activity-history"]').click();
    cy.get('[data-cy="activity-list"]').should('be.visible');
    cy.get('[data-cy="activity-item"]').should('have.length.at.least', 1);
  });

  it('should manage connected accounts', () => {
    cy.get('[data-cy="connected-accounts"]').click();
    cy.get('[data-cy="connect-google"]').should('be.visible');
    cy.get('[data-cy="connect-facebook"]').should('be.visible');
  });

  it('should handle account deletion', () => {
    cy.get('[data-cy="danger-zone"]').click();
    cy.get('[data-cy="delete-account"]').click();
    cy.get('[data-cy="confirm-delete-input"]').type('DELETE');
    cy.get('[data-cy="confirm-delete-button"]').click();
    cy.url().should('equal', Cypress.config().baseUrl + '/');
  });
});
