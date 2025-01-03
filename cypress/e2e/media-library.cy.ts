describe('Media Library', () => {
  beforeEach(() => {
    cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    cy.visit('/admin/media');
  });

  it('should display media library grid', () => {
    cy.get('[data-cy="media-grid"]').should('be.visible');
    cy.get('[data-cy="media-item"]').should('have.length.at.least', 1);
  });

  it('should upload new media', () => {
    cy.get('[data-cy="upload-media"]').click();
    cy.get('[data-cy="media-upload-input"]').selectFile(['cypress/fixtures/image1.jpg', 'cypress/fixtures/image2.jpg']);
    cy.get('[data-cy="upload-progress"]').should('be.visible');
    cy.get('[data-cy="success-message"]').should('be.visible');
    cy.get('[data-cy="media-item"]').should('have.length.at.least', 2);
  });

  it('should support drag and drop upload', () => {
    cy.get('[data-cy="media-dropzone"]').selectFile('cypress/fixtures/image1.jpg', {
      action: 'drag-drop'
    });
    cy.get('[data-cy="upload-progress"]').should('be.visible');
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should edit media metadata', () => {
    cy.get('[data-cy="media-item"]').first().click();
    cy.get('[data-cy="media-title"]').clear().type('Updated Image Title');
    cy.get('[data-cy="media-alt"]').clear().type('Updated Alt Text');
    cy.get('[data-cy="media-description"]').clear().type('Updated description');
    cy.get('[data-cy="save-media"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should organize media with folders', () => {
    cy.get('[data-cy="create-folder"]').click();
    cy.get('[data-cy="folder-name"]').type('New Folder');
    cy.get('[data-cy="save-folder"]').click();
    
    // Drag media into folder
    cy.get('[data-cy="media-item"]').first().drag('[data-cy="folder-item"]');
    cy.get('[data-cy="folder-item"]').click();
    cy.get('[data-cy="media-item"]').should('have.length.at.least', 1);
  });

  it('should filter media by type', () => {
    cy.get('[data-cy="media-filter"]').click();
    cy.get('[data-cy="filter-images"]').click();
    cy.get('[data-cy="media-item"]').should('have.attr', 'data-type', 'image');
  });

  it('should search media items', () => {
    cy.get('[data-cy="media-search"]').type('test');
    cy.get('[data-cy="media-item"]').should('have.length.at.least', 1);
  });

  it('should bulk select and manage media', () => {
    cy.get('[data-cy="bulk-select"]').click();
    cy.get('[data-cy="media-item"]').first().click();
    cy.get('[data-cy="media-item"]').last().click();
    cy.get('[data-cy="bulk-delete"]').click();
    cy.get('[data-cy="confirm-delete"]').click();
    cy.get('[data-cy="success-message"]').should('be.visible');
  });

  it('should display media details and stats', () => {
    cy.get('[data-cy="media-item"]').first().click();
    cy.get('[data-cy="media-details"]').should('be.visible');
    cy.get('[data-cy="media-size"]').should('be.visible');
    cy.get('[data-cy="media-dimensions"]').should('be.visible');
    cy.get('[data-cy="media-created"]').should('be.visible');
    cy.get('[data-cy="media-usage"]').should('be.visible');
  });

  it('should handle media optimization', () => {
    cy.get('[data-cy="media-item"]').first().click();
    cy.get('[data-cy="optimize-media"]').click();
    cy.get('[data-cy="optimization-progress"]').should('be.visible');
    cy.get('[data-cy="success-message"]').should('be.visible');
  });
});
