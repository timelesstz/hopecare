describe('Donation Flow', () => {
  beforeEach(() => {
    cy.visit('/donate');
  });

  it('should display donation form', () => {
    cy.get('[data-cy="donation-form"]').should('be.visible');
    cy.get('[data-cy="donation-amount"]').should('be.visible');
    cy.get('[data-cy="donation-frequency"]').should('be.visible');
  });

  it('should allow custom donation amount', () => {
    cy.get('[data-cy="custom-amount"]').type('150');
    cy.get('[data-cy="donation-amount"]').should('have.value', '150');
  });

  it('should select donation frequency', () => {
    cy.get('[data-cy="frequency-monthly"]').click();
    cy.get('[data-cy="frequency-monthly"]').should('have.class', 'selected');
  });

  it('should show Stripe form when proceeding to payment', () => {
    cy.get('[data-cy="custom-amount"]').type('100');
    cy.get('[data-cy="proceed-payment"]').click();
    cy.get('[data-cy="stripe-form"]').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('[data-cy="proceed-payment"]').click();
    cy.get('[data-cy="amount-error"]').should('be.visible');
  });

  it('should show donation summary', () => {
    cy.get('[data-cy="custom-amount"]').type('200');
    cy.get('[data-cy="frequency-monthly"]').click();
    cy.get('[data-cy="donation-summary"]').should('contain', '$200');
    cy.get('[data-cy="donation-summary"]').should('contain', 'Monthly');
  });

  // This test requires Stripe test mode
  it('should complete donation with test card', () => {
    cy.get('[data-cy="custom-amount"]').type('50');
    cy.get('[data-cy="proceed-payment"]').click();
    
    // Fill Stripe test card details
    cy.get('[data-cy="card-number"]').type('4242424242424242');
    cy.get('[data-cy="card-expiry"]').type('1234');
    cy.get('[data-cy="card-cvc"]').type('123');
    
    cy.get('[data-cy="submit-payment"]').click();
    
    // Should redirect to success page
    cy.url().should('include', '/donation/success');
    cy.get('[data-cy="success-message"]').should('be.visible');
  });
});
