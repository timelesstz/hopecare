describe('Donation Management', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@hopecaretz.org');
    cy.get('input[type="password"]').type('Hope@admin2');
    cy.get('button[type="submit"]').click();
    
    // Navigate to donations management
    cy.visit('/admin/donations');
  });

  it('should display the donations dashboard', () => {
    cy.url().should('include', '/admin/donations');
    cy.get('h1').should('contain', 'Donations');
    cy.get('[data-cy="donations-summary"]').should('be.visible');
  });

  it('should display list of donations', () => {
    cy.get('[data-cy="donations-list"]').should('be.visible');
    cy.get('[data-cy="donation-item"]').should('have.length.at.least', 1);
  });

  it('should filter donations by date range', () => {
    // Open date filter
    cy.get('[data-cy="date-filter"]').click();
    
    // Select last 30 days
    cy.get('[data-cy="last-30-days"]').click();
    
    // Apply filter
    cy.get('[data-cy="apply-filter"]').click();
    
    // Check if filter is applied
    cy.get('[data-cy="active-filters"]').should('contain', 'Last 30 days');
    
    // Should show filtered results
    cy.get('[data-cy="donations-list"]').should('be.visible');
  });

  it('should filter donations by donor', () => {
    // Open donor filter
    cy.get('[data-cy="donor-filter"]').click();
    
    // Select first donor from dropdown
    cy.get('[data-cy="donor-option"]').first().click();
    
    // Apply filter
    cy.get('[data-cy="apply-filter"]').click();
    
    // Check if filter is applied
    cy.get('[data-cy="active-filters"]').should('contain', 'Donor:');
    
    // Should show filtered results
    cy.get('[data-cy="donations-list"]').should('be.visible');
  });

  it('should view donation details', () => {
    // Click on the first donation
    cy.get('[data-cy="donation-item"]').first().click();
    
    // Should navigate to donation details
    cy.url().should('include', '/admin/donations/');
    
    // Check if details are displayed
    cy.get('[data-cy="donation-details"]').should('be.visible');
    cy.get('[data-cy="donor-info"]').should('be.visible');
    cy.get('[data-cy="payment-info"]').should('be.visible');
  });

  it('should export donations report', () => {
    // Click export button
    cy.get('[data-cy="export-button"]').click();
    
    // Select export format
    cy.get('[data-cy="export-csv"]').click();
    
    // Should show success message
    cy.get('[data-cy="success-toast"]').should('be.visible');
    
    // File download is hard to test in Cypress, but we can check if the export request was made
    cy.get('[data-cy="export-progress"]').should('exist');
  });

  describe('Donation Creation', () => {
    it('should create a manual donation record', () => {
      // Click create donation button
      cy.get('[data-cy="create-donation-button"]').click();
      
      // Fill in donation details
      cy.get('[data-cy="donor-select"]').click();
      cy.get('[data-cy="donor-option"]').first().click();
      
      const amount = Math.floor(Math.random() * 1000) + 10;
      cy.get('[data-cy="donation-amount"]').type(amount.toString());
      
      cy.get('[data-cy="payment-method"]').select('BANK_TRANSFER');
      cy.get('[data-cy="donation-date"]').type('2025-04-18');
      cy.get('[data-cy="donation-notes"]').type('Manual donation created via Cypress test');
      
      // Submit form
      cy.get('[data-cy="submit-donation"]').click();
      
      // Should show success message
      cy.get('[data-cy="success-toast"]').should('be.visible');
      
      // Should redirect back to donations list
      cy.url().should('include', '/admin/donations');
      
      // New donation should be in the list
      cy.get('[data-cy="donation-item"]').should('contain', amount.toString());
    });
  });

  describe('Donation Analytics', () => {
    it('should display donation analytics', () => {
      // Navigate to donation analytics
      cy.get('[data-cy="donation-analytics-tab"]').click();
      
      // Check if analytics components are visible
      cy.get('[data-cy="donations-chart"]').should('be.visible');
      cy.get('[data-cy="donations-by-month"]').should('be.visible');
      cy.get('[data-cy="top-donors"]').should('be.visible');
      cy.get('[data-cy="donation-growth"]').should('be.visible');
    });

    it('should filter analytics by date range', () => {
      // Navigate to donation analytics
      cy.get('[data-cy="donation-analytics-tab"]').click();
      
      // Open date filter
      cy.get('[data-cy="analytics-date-filter"]').click();
      
      // Select last 12 months
      cy.get('[data-cy="last-12-months"]').click();
      
      // Apply filter
      cy.get('[data-cy="apply-analytics-filter"]').click();
      
      // Check if filter is applied
      cy.get('[data-cy="active-analytics-filters"]').should('contain', 'Last 12 months');
      
      // Chart should update
      cy.get('[data-cy="donations-chart"]').should('be.visible');
    });
  });
});
