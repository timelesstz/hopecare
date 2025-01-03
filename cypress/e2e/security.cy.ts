describe('Security Tests', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
    cy.intercept('GET', '/api/user/profile').as('profileRequest');
  });

  it('Should prevent XSS attacks in input fields', () => {
    const xssScript = '<script>alert("xss")</script>';
    
    cy.visit('/contact');
    cy.get('[data-cy="contact-form"]').within(() => {
      cy.get('input[name="name"]').type(xssScript);
      cy.get('textarea[name="message"]').type(xssScript);
    });
    
    cy.get('body').should('not.contain.html', '<script>');
  });

  it('Should enforce password strength requirements', () => {
    cy.visit('/register');
    cy.get('[data-cy="password-input"]').type('weak');
    cy.get('[data-cy="password-strength-indicator"]').should('contain', 'Weak');
    
    cy.get('[data-cy="password-input"]').clear().type('StrongP@ssw0rd');
    cy.get('[data-cy="password-strength-indicator"]').should('contain', 'Strong');
  });

  it('Should handle CSRF tokens correctly', () => {
    cy.visit('/login');
    cy.get('form').should('have.attr', 'data-csrf');
    
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();
    });
    
    cy.wait('@loginRequest').its('request.headers').should('have.property', 'x-csrf-token');
  });

  it('Should implement rate limiting', () => {
    const attempts = Array(6).fill(null);
    
    cy.wrap(attempts).each(() => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        if (attempts.indexOf(null) === 5) {
          expect(response.status).to.equal(429);
        }
      });
    });
  });

  it('Should properly handle authentication tokens', () => {
    cy.login('test@example.com', 'password');
    cy.wait('@loginRequest');
    
    cy.getCookie('session').should('exist');
    cy.visit('/profile');
    cy.wait('@profileRequest')
      .its('request.headers')
      .should('have.property', 'authorization');
  });

  it('Should implement secure headers', () => {
    cy.request('/').then((response) => {
      const headers = response.headers;
      expect(headers).to.have.property('strict-transport-security');
      expect(headers).to.have.property('x-frame-options');
      expect(headers).to.have.property('x-content-type-options');
      expect(headers).to.have.property('content-security-policy');
    });
  });

  it('Should sanitize file uploads', () => {
    cy.login('admin@example.com', 'password');
    cy.visit('/admin/media');
    
    // Test file type restrictions
    cy.get('[data-cy="file-upload"]').selectFile({
      contents: Cypress.Buffer.from('fake executable'),
      fileName: 'malicious.exe',
      lastModified: Date.now(),
    }, { force: true });
    
    cy.get('[data-cy="upload-error"]').should('contain', 'File type not allowed');
  });

  it('Should protect against SQL injection', () => {
    const sqlInjection = "' OR '1'='1";
    
    cy.visit('/login');
    cy.get('[data-cy="login-form"]').within(() => {
      cy.get('input[name="email"]').type(`test@example.com${sqlInjection}`);
      cy.get('input[name="password"]').type(sqlInjection);
      cy.get('button[type="submit"]').click();
    });
    
    cy.url().should('include', '/login');
    cy.get('[data-cy="error-message"]').should('exist');
  });
});
