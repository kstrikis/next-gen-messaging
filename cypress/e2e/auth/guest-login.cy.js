describe('Guest Login', () => {
  beforeEach(() => {
    // Start from a clean slate
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should show the guest login form', () => {
    cy.get('input[placeholder="Enter a guest name (optional)"]').should('be.visible');
    cy.get('button').contains('Join as Guest').should('be.visible');
  });

  it('should handle empty guest name by generating anonymous animal name', () => {
    // Intercept the guest login request before clicking
    cy.intercept('POST', '/api/auth/guest').as('guestLogin');
    
    // Intercept the /me request that will happen after login
    cy.intercept('GET', '/api/auth/me').as('getUser');
    
    cy.get('button').contains('Join as Guest').click();
    
    // Wait for the API call and verify the request format
    cy.wait('@guestLogin').then((interception) => {
      expect(interception.request.body).to.have.property('username', '');
      // Response should contain an Anonymous Animal name with guest prefix
      expect(interception.response.body.user.username).to.match(/^guest\d{4}_Anonymous [A-Z][a-z]+$/);
    });

    // Verify we're redirected to the general channel
    cy.url().should('include', '/channel/general');

    // Wait for user info to load
    cy.wait('@getUser');

    // Verify the username is displayed in the header
    cy.contains('Logged in as').next('span.font-medium').invoke('text')
      .should('match', /^guest\d{4}_Anonymous [A-Z][a-z]+$/);

    // Verify the token is stored in localStorage
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.exist;
    });
  });

  it('should successfully login as guest with custom name', () => {
    const guestName = `Test_User_${Date.now()}`;

    // Intercept the guest login request
    cy.intercept('POST', '/api/auth/guest').as('guestLogin');
    
    // Intercept the /me request that will happen after login
    cy.intercept('GET', '/api/auth/me').as('getUser');

    // Enter guest name and submit
    cy.get('input[placeholder="Enter a guest name (optional)"]').type(guestName);
    cy.get('button').contains('Join as Guest').click();

    // Wait for the API call and verify the request
    cy.wait('@guestLogin').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        username: guestName,
      });
      
      // Verify response contains guest prefix and preserves underscores
      expect(interception.response.body.user.username).to.match(/^guest\d{4}_Test_User_\d+$/);
    });

    // Verify we're redirected to the general channel
    cy.url().should('include', '/channel/general');

    // Wait for user info to load
    cy.wait('@getUser');

    // Verify the username is displayed in the header
    cy.contains('Logged in as').next('span.font-medium').invoke('text')
      .should('match', /^guest\d{4}_Test_User_\d+$/);

    // Verify the token is stored in localStorage
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.exist;
    });
  });

  it('should handle international names correctly', () => {
    // Intercept the guest login request
    cy.intercept('POST', '/api/auth/guest').as('guestLogin');
    
    // Intercept the /me request that will happen after login
    cy.intercept('GET', '/api/auth/me').as('getUser');

    // Enter Chinese name and submit
    cy.get('input[placeholder="Enter a guest name (optional)"]').type('张伟');
    cy.get('button').contains('Join as Guest').click();

    // Wait for the API call and verify username is preserved
    cy.wait('@guestLogin').then((interception) => {
      expect(interception.response.body.user.username).to.match(/^guest\d{4}_张伟$/);
    });

    // Verify we're redirected to the general channel
    cy.url().should('include', '/channel/general');

    // Wait for user info to load
    cy.wait('@getUser');

    // Verify the username is displayed in the header
    cy.contains('Logged in as').next('span.font-medium').invoke('text')
      .should('match', /^guest\d{4}_张伟$/);
  });

  it('should clean invalid characters but preserve underscores', () => {
    const dirtyName = 'Test_User_Name!@#$%^&*()';
    
    // Intercept the guest login request
    cy.intercept('POST', '/api/auth/guest').as('guestLogin');
    
    // Intercept the /me request that will happen after login
    cy.intercept('GET', '/api/auth/me').as('getUser');

    // Enter guest name and submit
    cy.get('input[placeholder="Enter a guest name (optional)"]').type(dirtyName);
    cy.get('button').contains('Join as Guest').click();

    // Wait for the API call and verify cleaned username in response
    cy.wait('@guestLogin').then((interception) => {
      expect(interception.response.body.user.username).to.match(/^guest\d{4}_Test_User_Name$/);
    });

    // Verify we're redirected to the general channel
    cy.url().should('include', '/channel/general');

    // Wait for user info to load
    cy.wait('@getUser');

    // Verify the username is displayed in the header
    cy.contains('Logged in as').next('span.font-medium').invoke('text')
      .should('match', /^guest\d{4}_Test_User_Name$/);
  });

  it('should handle long usernames by truncating', () => {
    const longName = 'a_'.repeat(100); // Include underscores in long name
    
    // Intercept the guest login request
    cy.intercept('POST', '/api/auth/guest').as('guestLogin');
    
    // Intercept the /me request that will happen after login
    cy.intercept('GET', '/api/auth/me').as('getUser');

    // Enter guest name and submit
    cy.get('input[placeholder="Enter a guest name (optional)"]').type(longName);
    cy.get('button').contains('Join as Guest').click();

    // Wait for the API call and verify truncated username in response
    cy.wait('@guestLogin').then((interception) => {
      const username = interception.response.body.user.username;
      expect(username.length).to.be.lessThan(65); // 50 + prefix length
      expect(username).to.match(/^guest\d{4}_(?:[a-z]_)+[a-z]?$/i); // Should preserve underscore pattern
    });

    // Verify we're redirected to the general channel
    cy.url().should('include', '/channel/general');

    // Wait for user info to load
    cy.wait('@getUser');

    // Verify the username is displayed in the header and truncated
    cy.contains('Logged in as').next('span.font-medium').invoke('text').then((text) => {
      expect(text.length).to.be.lessThan(65); // 50 + prefix length
      expect(text).to.match(/^guest\d{4}_(?:[a-z]_)+[a-z]?$/i);
    });
  });
}); 