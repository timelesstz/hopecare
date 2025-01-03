describe('Content Management', () => {
  beforeEach(() => {
    cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    cy.visit('/admin/content');
  });

  it('should list existing content', () => {
    cy.get('[data-cy="content-list"]').should('be.visible');
    cy.get('[data-cy="content-item"]').should('have.length.at.least', 1);
  });

  it('should create new content', () => {
    cy.get('[data-cy="create-content"]').click();
    
    // Fill in content details
    cy.get('[data-cy="content-title"]').type('Test Article');
    cy.get('[data-cy="content-slug"]').type('test-article');
    cy.get('[data-cy="content-category"]').select('Blog');
    
    // Use rich text editor
    cy.get('[data-cy="content-editor"] .tiptap').type('This is a test article content');
    
    // Add featured image
    cy.get('[data-cy="featured-image-upload"]').selectFile('cypress/fixtures/test-image.jpg');
    
    // Save content
    cy.get('[data-cy="save-content"]').click();
    
    // Verify success
    cy.get('[data-cy="success-message"]').should('be.visible');
    cy.url().should('include', '/admin/content');
  });

  it('should edit existing content', () => {
    cy.get('[data-cy="content-item"]').first().click();
    cy.get('[data-cy="content-title"]').clear().type('Updated Title');
    cy.get('[data-cy="save-content"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should manage content status', () => {
    cy.get('[data-cy="content-status-toggle"]').first().click();
    cy.get('[data-cy="status-draft"]').click();
    cy.get('[data-cy="content-item"]').first().should('contain', 'Draft');
  });

  it('should support content scheduling', () => {
    cy.get('[data-cy="content-item"]').first().click();
    cy.get('[data-cy="schedule-toggle"]').click();
    cy.get('[data-cy="schedule-date"]').type('2024-12-31');
    cy.get('[data-cy="schedule-time"]').type('12:00');
    cy.get('[data-cy="save-content"]').click();
    cy.get('[data-cy="scheduled-badge"]').should('be.visible');
  });

  it('should allow content categorization', () => {
    cy.get('[data-cy="create-content"]').click();
    cy.get('[data-cy="content-category"]').click();
    cy.get('[data-cy="new-category"]').click();
    cy.get('[data-cy="category-name"]').type('New Category');
    cy.get('[data-cy="save-category"]').click();
    cy.get('[data-cy="content-category"]').should('contain', 'New Category');
  });

  it('should support content versioning', () => {
    cy.get('[data-cy="content-item"]').first().click();
    cy.get('[data-cy="version-history"]').click();
    cy.get('[data-cy="version-list"]').should('be.visible');
    cy.get('[data-cy="version-item"]').should('have.length.at.least', 1);
  });

  it('should handle content deletion', () => {
    cy.get('[data-cy="content-item"]').first().find('[data-cy="delete-content"]').click();
    cy.get('[data-cy="confirm-delete"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });
});
