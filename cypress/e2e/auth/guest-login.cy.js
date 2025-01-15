describe('Guest Login', () => {
  beforeEach(() => {
    // Clear all storage and cookies
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Clear Auth0 storage
    cy.window().then(win => {
      win.indexedDB.deleteDatabase('auth0spa');
    });
    
    // Set up all API intercepts before any actions
    cy.intercept('POST', '/api/auth/guest').as('guestLogin');
    cy.intercept('GET', '/api/auth/me').as('getUser');
    cy.intercept('GET', '/api/channels/*').as('getChannel');
    cy.intercept('GET', '/api/channels/*/messages').as('getMessages');
    
    // Log that we're starting fresh
    cy.log('Starting test with clean state');
    
    // Visit the page after clearing storage
    cy.window().then(win => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    
    cy.log('Visiting home page');
    cy.visit('/');
    
    // Wait for the page to be ready
    cy.log('Waiting for page to load');
    cy.get('body').should('exist');

    // Verify we're on the login page and not logged in
    cy.url().should('match', /\/$/);
    cy.get('input[placeholder="Enter a guest name (optional)"]').should('exist');
  });

  afterEach(() => {
    // Clear storage again
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Log any remaining storage for debugging
    cy.window().then((win) => {
      const localStorage = win.localStorage.length;
      const sessionStorage = win.sessionStorage.length;
      
      cy.log('After test cleanup check:', {
        localStorage,
        sessionStorage,
      });

      // Verify storage is empty
      expect(localStorage).to.equal(0);
      expect(sessionStorage).to.equal(0);
    });
  });

  // Custom command to verify channel messages load
  Cypress.Commands.add('verifyChannelMessagesLoad', () => {
    // Wait for auth verification and channel data
    cy.log('Waiting for user verification API call');
    cy.wait('@getUser').then(interception => {
      cy.log('User verification API call intercepted', {
        status: interception.response?.statusCode,
        body: interception.response?.body
      });
    });

    cy.log('Waiting for channel data API call');
    cy.wait('@getChannel').then(interception => {
      cy.log('Channel data API call intercepted', {
        status: interception.response?.statusCode,
        body: interception.response?.body,
        url: interception.request.url
      });
    });

    // Wait for messages API call
    cy.log('Waiting for messages API call');
    cy.wait('@getMessages').then(interception => {
      cy.log('Messages API call intercepted', {
        status: interception.response?.statusCode,
        messageCount: interception.response?.body?.length || 0,
        url: interception.request.url
      });
    });

    // Wait for messages to load
    cy.log('Waiting for messages to load');
    cy.get('[data-testid^="message-list-"]').should('exist'); // Wait for either empty or loaded state
  });

  it('should show the guest login form', () => {
    cy.log('Checking for guest login form elements');
    // Add timeout and retry until element is found
    cy.get('input[placeholder="Enter a guest name (optional)"]', { timeout: 2000 })
      .should('exist')
      .and('not.be.disabled')
      .and('have.attr', 'placeholder', 'Enter a guest name (optional)');
    
    cy.get('button')
      .contains('Join as Guest')
      .should('exist')
      .and('not.be.disabled');
  });

  it('should handle empty guest name by generating anonymous animal name', () => {
    cy.log('Starting empty guest name test');
    cy.get('button')
      .contains('Join as Guest')
      .should('exist')
      .and('not.be.disabled')
      .click();
    
    // Wait for the API call and verify the request format
    cy.wait('@guestLogin').then((interception) => {
      cy.log('Guest login response received', interception.response.body);
      expect(interception.request.body).to.have.property('username', '');
      // Response should contain an Anonymous Animal name with guest prefix
      expect(interception.response.body.user.username).to.match(/^guest\d{4}_Anonymous [A-Z][a-z]+$/);
    });

    // Verify channel messages load
    cy.verifyChannelMessagesLoad();

    // Verify we're redirected to a channel URL
    cy.url().should('match', /\/channel\/[\w-]+$/);

    // Verify the username is displayed in the header
    cy.contains('Logged in as')
      .should('exist')
      .next('span.font-medium')
      .should('exist')
      .invoke('text')
      .should('match', /^guest\d{4}_Anonymous [A-Z][a-z]+$/);

    // Verify the token is stored in localStorage
    cy.window().then((window) => {
      const token = window.localStorage.getItem('token');
      cy.log('Found token in localStorage:', token ? 'exists' : 'missing');
      expect(token).to.exist;
    });
  });

  it('should successfully login as guest with custom name', () => {
    const guestName = `Test_User_FooBar`;
    cy.log('Starting guest login test with name:', guestName);

    // Wait for and verify form is ready
    cy.log('Waiting for input field');
    cy.get('input[placeholder="Enter a guest name (optional)"]', { timeout: 2000 })
      .should('exist')
      .and('not.be.disabled')
      .type(guestName);

    cy.log('Waiting for submit button');
    cy.get('button')
      .contains('Join as Guest')
      .should('exist')
      .and('not.be.disabled')
      .click();

    // Wait for the API call and verify the request
    cy.log('Waiting for guest login API call');
    cy.wait('@guestLogin').then((interception) => {
      cy.log('Guest login API call intercepted', {
        requestBody: interception.request.body,
        responseBody: interception.response.body
      });
      expect(interception.request.body).to.deep.equal({
        username: guestName,
      });
      
      // Verify response contains guest prefix and preserves underscores
      expect(interception.response.body.user.username).to.match(/^guest\d{4}_Test_User_FooBar$/);
    });

    // Verify channel messages load
    cy.verifyChannelMessagesLoad();

    // Wait for auth verification and channel data
    cy.log('Waiting for user verification API call');
    cy.wait('@getUser').then(interception => {
      cy.log('User verification API call intercepted', {
        status: interception.response?.statusCode,
        body: interception.response?.body
      });
    });

    cy.log('Waiting for channel data API call');
    cy.wait('@getChannel').then(interception => {
      cy.log('Channel data API call intercepted', {
        status: interception.response?.statusCode,
        body: interception.response?.body,
        url: interception.request.url
      });
    });

    // TODO: Update application to use channel names in URLs instead of UUIDs for better UX
    // Verify we're redirected to a channel URL
    cy.log('Checking URL for channel redirect');
    cy.url().should('match', /\/channel\/[\w-]+$/);

    // Verify the username is displayed in the header
    cy.log('Verifying username in header');
    cy.contains('Logged in as')
      .should('exist')
      .next('span.font-medium')
      .should('exist')
      .invoke('text')
      .should('match', /^guest\d{4}_Test_User_FooBar$/);

    // Verify the token is stored in localStorage
    cy.log('Checking localStorage for token');
    cy.window().then((window) => {
      const token = window.localStorage.getItem('token');
      cy.log('Found token in localStorage:', token ? 'exists' : 'missing');
      expect(token).to.exist;
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

    // Verify channel messages load
    cy.verifyChannelMessagesLoad();

    // Verify we're redirected to a channel URL
    cy.url().should('match', /\/channel\/[\w-]+$/);

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

    // Verify channel messages load
    cy.verifyChannelMessagesLoad();

    // Verify we're redirected to a channel URL
    cy.url().should('match', /\/channel\/[\w-]+$/);

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

    // Verify channel messages load
    cy.verifyChannelMessagesLoad();

    // Verify we're redirected to a channel URL
    cy.url().should('match', /\/channel\/[\w-]{36}$/);

    // Wait for user info to load
    cy.wait('@getUser');

    // Verify the username is displayed in the header and truncated
    cy.contains('Logged in as').next('span.font-medium').invoke('text').then((text) => {
      expect(text.length).to.be.lessThan(65); // 50 + prefix length
      expect(text).to.match(/^guest\d{4}_(?:[a-z]_)+[a-z]?$/i);
    });
  });
}); 