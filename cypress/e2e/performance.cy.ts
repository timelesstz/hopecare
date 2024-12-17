describe('Performance Tests', () => {
  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('Homepage should load within performance budget', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start-loading');
      },
    });

    cy.window().then((win) => {
      win.performance.mark('end-loading');
      win.performance.measure('page-load', 'start-loading', 'end-loading');
      const measure = win.performance.getEntriesByName('page-load')[0];
      expect(measure.duration).to.be.lessThan(3000); // 3s budget
    });

    // Check First Contentful Paint
    cy.window().then((win) => {
      const fcp = win.performance.getEntriesByType('paint').find(
        (entry) => entry.name === 'first-contentful-paint'
      );
      expect(fcp.startTime).to.be.lessThan(1500); // 1.5s budget
    });
  });

  it('Donation form should render quickly', () => {
    cy.visit('/donate');
    cy.get('[data-cy="donation-form"]', { timeout: 1000 }).should('be.visible');
  });

  it('Admin dashboard should load data efficiently', () => {
    cy.login('admin@example.com', 'password');
    cy.visit('/admin/dashboard');
    
    cy.window().then((win) => {
      win.performance.mark('start-data-load');
    });

    cy.get('[data-cy="dashboard-stats"]').should('be.visible');
    
    cy.window().then((win) => {
      win.performance.mark('end-data-load');
      win.performance.measure('data-load', 'start-data-load', 'end-data-load');
      const measure = win.performance.getEntriesByName('data-load')[0];
      expect(measure.duration).to.be.lessThan(2000); // 2s budget
    });
  });

  it('Media library should handle large galleries', () => {
    cy.login('admin@example.com', 'password');
    cy.visit('/admin/media');
    
    cy.window().then((win) => {
      win.performance.mark('start-gallery-load');
    });

    cy.get('[data-cy="media-grid"]').should('be.visible');
    
    cy.window().then((win) => {
      win.performance.mark('end-gallery-load');
      win.performance.measure('gallery-load', 'start-gallery-load', 'end-gallery-load');
      const measure = win.performance.getEntriesByName('gallery-load')[0];
      expect(measure.duration).to.be.lessThan(1500); // 1.5s budget
    });
  });

  it('Should maintain smooth scrolling performance', () => {
    cy.visit('/');
    cy.scrollTo('bottom', { duration: 1000 });
    
    cy.window().then((win) => {
      const fps = win.performance.getEntriesByType('frame');
      const averageFps = 1000 / (fps.reduce((sum, frame) => sum + frame.duration, 0) / fps.length);
      expect(averageFps).to.be.greaterThan(30); // Minimum 30 FPS
    });
  });
});
