describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.injectAxe();
  });

  it('Homepage should be accessible', () => {
    cy.visit('/');
    cy.checkA11y('[data-cy="main-nav"]');
    cy.checkA11y('[data-cy="hero-section"]');
    cy.checkA11y('[data-cy="featured-programs"]');
    cy.checkA11y('footer');
  });

  it('Donation form should be accessible', () => {
    cy.visit('/donate');
    cy.checkA11y('[data-cy="donation-form"]', {
      rules: {
        'color-contrast': { enabled: true },
        'label': { enabled: true },
        'form-field-multiple-labels': { enabled: true }
      }
    });
  });

  it('Admin dashboard should be accessible', () => {
    cy.login('admin@example.com', 'password');
    cy.visit('/admin/dashboard');
    cy.checkA11y('[data-cy="admin-dashboard"]', {
      rules: {
        'region': { enabled: true },
        'landmark-unique': { enabled: true }
      }
    });
  });

  it('Media library should be accessible', () => {
    cy.login('admin@example.com', 'password');
    cy.visit('/admin/media');
    cy.checkA11y('[data-cy="media-library"]', {
      rules: {
        'image-alt': { enabled: true },
        'button-name': { enabled: true }
      }
    });
  });

  it('Navigation should be keyboard accessible', () => {
    cy.visit('/');
    cy.get('[data-cy="nav-links"] a').first().focus().type('{enter}');
    cy.url().should('include', '/programs');
    
    cy.get('[data-cy="nav-links"] a').should('have.length.gt', 0)
      .each(($el) => {
        cy.wrap($el)
          .should('have.attr', 'tabindex')
          .and('not.eq', '-1');
      });
  });

  it('Forms should have proper ARIA labels', () => {
    cy.visit('/donate');
    cy.get('form').within(() => {
      cy.get('input, select, textarea').each(($el) => {
        cy.wrap($el).should('have.attr', 'aria-label')
          .or('have.attr', 'aria-labelledby')
          .or('have.attr', 'title');
      });
    });
  });

  it('Color contrast should meet WCAG standards', () => {
    cy.visit('/');
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  it('Images should have alt text', () => {
    cy.visit('/');
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
  });
});
