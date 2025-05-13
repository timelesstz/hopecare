describe('Content Management System', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@hopecaretz.org');
    cy.get('input[type="password"]').type('Hope@admin2');
    cy.get('button[type="submit"]').click();
    
    // Navigate to content management
    cy.visit('/admin/content');
  });

  describe('Content Navigation', () => {
    it('should display the main content management view', () => {
      cy.url().should('include', '/admin/content');
      cy.get('h1').should('contain', 'Content Management');
    });

    it('should navigate to blog posts listing', () => {
      cy.contains('Blog Posts').click();
      cy.url().should('include', '/admin/content/posts');
      cy.get('h2').should('contain', 'Blog Posts');
    });

    it('should navigate to pages listing', () => {
      cy.contains('Pages').click();
      cy.url().should('include', '/admin/content/pages');
      cy.get('h2').should('contain', 'Pages');
    });
  });

  describe('Blog Posts Management', () => {
    beforeEach(() => {
      // Navigate to blog posts
      cy.contains('Blog Posts').click();
    });

    it('should display list of blog posts', () => {
      cy.get('[data-cy="blog-post-list"]').should('be.visible');
      cy.get('[data-cy="blog-post-item"]').should('have.length.at.least', 1);
    });

    it('should create a new blog post', () => {
      const testTitle = `Test Post ${Date.now()}`;
      
      // Click create new post button
      cy.get('[data-cy="create-post-button"]').click();
      
      // Should navigate to editor
      cy.url().should('include', '/admin/content/editor/post/');
      
      // Fill in post details
      cy.get('[data-cy="post-title-input"]').type(testTitle);
      cy.get('[data-cy="post-content-editor"]').type('This is a test post content created by Cypress.');
      cy.get('[data-cy="post-meta-description"]').type('Test meta description');
      cy.get('[data-cy="post-status"]').select('DRAFT');
      
      // Save the post
      cy.get('[data-cy="save-post-button"]').click();
      
      // Should show success message
      cy.get('[data-cy="success-toast"]').should('be.visible');
      
      // Go back to posts list
      cy.visit('/admin/content/posts');
      
      // Should see the new post in the list
      cy.contains(testTitle).should('be.visible');
    });

    it('should edit an existing blog post', () => {
      // Click on the first post's edit button
      cy.get('[data-cy="blog-post-item"]').first().find('[data-cy="edit-button"]').click();
      
      // Should navigate to editor
      cy.url().should('include', '/admin/content/editor/post/');
      
      // Update the title
      const updatedTitle = `Updated Post ${Date.now()}`;
      cy.get('[data-cy="post-title-input"]').clear().type(updatedTitle);
      
      // Save the post
      cy.get('[data-cy="save-post-button"]').click();
      
      // Should show success message
      cy.get('[data-cy="success-toast"]').should('be.visible');
      
      // Go back to posts list
      cy.visit('/admin/content/posts');
      
      // Should see the updated post in the list
      cy.contains(updatedTitle).should('be.visible');
    });

    it('should delete a blog post', () => {
      // Create a post to delete
      const deleteTestTitle = `Delete Test ${Date.now()}`;
      
      // Click create new post button
      cy.get('[data-cy="create-post-button"]').click();
      
      // Fill in post details
      cy.get('[data-cy="post-title-input"]').type(deleteTestTitle);
      cy.get('[data-cy="post-content-editor"]').type('This post will be deleted.');
      cy.get('[data-cy="post-status"]').select('DRAFT');
      
      // Save the post
      cy.get('[data-cy="save-post-button"]').click();
      
      // Go back to posts list
      cy.visit('/admin/content/posts');
      
      // Find the post and click delete
      cy.contains(deleteTestTitle)
        .parents('[data-cy="blog-post-item"]')
        .find('[data-cy="delete-button"]')
        .click();
      
      // Confirm deletion in the modal
      cy.get('[data-cy="confirm-delete-button"]').click();
      
      // Should show success message
      cy.get('[data-cy="success-toast"]').should('be.visible');
      
      // Post should no longer be in the list
      cy.contains(deleteTestTitle).should('not.exist');
    });
  });

  describe('Pages Management', () => {
    beforeEach(() => {
      // Navigate to pages
      cy.contains('Pages').click();
    });

    it('should display list of pages', () => {
      cy.get('[data-cy="page-list"]').should('be.visible');
      cy.get('[data-cy="page-item"]').should('have.length.at.least', 1);
    });

    it('should create a new page', () => {
      const testTitle = `Test Page ${Date.now()}`;
      
      // Click create new page button
      cy.get('[data-cy="create-page-button"]').click();
      
      // Should navigate to editor
      cy.url().should('include', '/admin/content/editor/page/');
      
      // Fill in page details
      cy.get('[data-cy="page-title-input"]').type(testTitle);
      cy.get('[data-cy="page-content-editor"]').type('This is a test page content created by Cypress.');
      cy.get('[data-cy="page-meta-description"]').type('Test page meta description');
      cy.get('[data-cy="page-template"]').select('DEFAULT');
      cy.get('[data-cy="page-status"]').select('DRAFT');
      
      // Save the page
      cy.get('[data-cy="save-page-button"]').click();
      
      // Should show success message
      cy.get('[data-cy="success-toast"]').should('be.visible');
      
      // Go back to pages list
      cy.visit('/admin/content/pages');
      
      // Should see the new page in the list
      cy.contains(testTitle).should('be.visible');
    });

    it('should edit an existing page', () => {
      // Click on the first page's edit button
      cy.get('[data-cy="page-item"]').first().find('[data-cy="edit-button"]').click();
      
      // Should navigate to editor
      cy.url().should('include', '/admin/content/editor/page/');
      
      // Update the title
      const updatedTitle = `Updated Page ${Date.now()}`;
      cy.get('[data-cy="page-title-input"]').clear().type(updatedTitle);
      
      // Save the page
      cy.get('[data-cy="save-page-button"]').click();
      
      // Should show success message
      cy.get('[data-cy="success-toast"]').should('be.visible');
      
      // Go back to pages list
      cy.visit('/admin/content/pages');
      
      // Should see the updated page in the list
      cy.contains(updatedTitle).should('be.visible');
    });
  });

  describe('Content Revisions', () => {
    it('should display version history for a blog post', () => {
      // Navigate to blog posts
      cy.contains('Blog Posts').click();
      
      // Click on the first post's edit button
      cy.get('[data-cy="blog-post-item"]').first().find('[data-cy="edit-button"]').click();
      
      // Open version history
      cy.get('[data-cy="version-history-button"]').click();
      
      // Version history should be visible
      cy.get('[data-cy="version-history-modal"]').should('be.visible');
      cy.get('[data-cy="revision-item"]').should('have.length.at.least', 1);
    });

    it('should restore a previous version of content', () => {
      // Navigate to blog posts
      cy.contains('Blog Posts').click();
      
      // Click on the first post's edit button
      cy.get('[data-cy="blog-post-item"]').first().find('[data-cy="edit-button"]').click();
      
      // Make a change to create a new revision
      const originalTitle = cy.get('[data-cy="post-title-input"]').invoke('val');
      const updatedTitle = `Updated for Revision Test ${Date.now()}`;
      
      cy.get('[data-cy="post-title-input"]').clear().type(updatedTitle);
      cy.get('[data-cy="save-post-button"]').click();
      
      // Open version history
      cy.get('[data-cy="version-history-button"]').click();
      
      // Select the previous version
      cy.get('[data-cy="revision-item"]').eq(1).find('[data-cy="restore-button"]').click();
      
      // Confirm restoration
      cy.get('[data-cy="confirm-restore-button"]').click();
      
      // Should show success message
      cy.get('[data-cy="success-toast"]').should('be.visible');
      
      // Title should be restored to original
      cy.get('[data-cy="post-title-input"]').should('have.value', originalTitle);
    });
  });
});
