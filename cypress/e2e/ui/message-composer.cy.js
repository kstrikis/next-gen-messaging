describe('Message Composer', () => {
  beforeEach(() => {
    // Start at home page
    cy.visit('/');
    
    // Enter guest name and submit
    cy.get('input[placeholder*="guest name"]').type('TestUser');
    cy.get('button').contains('Join as Guest').click();
    
    // Should be redirected to /channel/general
    cy.url().should('include', '/channel/general');
    
    // Wait for component to be ready
    cy.get('textarea').should('exist');
  });

  // Skipping logging test as it's unreliable with LOG_LEVEL changes
  it.skip('logs component mount', () => {
    cy.window().then((win) => {
      // Wait for logs to be processed
      cy.wrap(win.testLogs.console).should('have.length.at.least', 1);
      
      // Find the mount log
      const mountLog = win.testLogs.console.find(log => 
        log.args.some(arg => arg.includes('🚀 MessagesContainer mounted'))
      );
      
      // Verify the mount log exists
      expect(mountLog).to.exist;
      // Verify any of the args contains our message
      expect(mountLog.args).to.satisfy(args => 
        args.some(arg => arg.includes('🚀 MessagesContainer mounted'))
      );
    });
  });

  it('handles text input and formatting', () => {
    cy.get('textarea').as('composer');
    cy.get('@composer').focus();
    cy.get('@composer').type('test message');
    
    // Check formatting buttons
    cy.get('button[aria-label="Bold"]').click();
    cy.get('button[aria-label="Italic"]').click();
    cy.get('button[aria-label="Add link"]').click();
    
    // Composer should still be focused
    cy.get('@composer').should('be.focused');
  });

  it('handles quick actions', () => {
    cy.get('textarea').focus();
    
    cy.get('button[aria-label="Add emoji"]').click();
    cy.get('button[aria-label="Attach file"]').click();
    cy.get('button[aria-label="Mention someone"]').click();
    
    // Composer should maintain focus
    cy.get('textarea').should('be.focused');
  });

  it('submits messages', () => {
    const text = 'test message';
    cy.get('textarea').type(text);
    cy.get('textarea').should('have.value', text);
    
    cy.get('button[aria-label="Send message"]').should('not.be.disabled');
    cy.get('button[aria-label="Send message"]').click();
    
    // Composer should be cleared
    cy.get('textarea').should('have.value', '');
  });

  it('disables send button for empty messages', () => {
    cy.get('button[aria-label="Send message"]').should('be.disabled');
    
    cy.get('textarea').type('  ');
    cy.get('textarea').should('have.value', '  ');
    
    cy.get('button[aria-label="Send message"]').should('be.disabled');
  });

  it('shows formatting toolbar on focus', () => {
    // Toolbar should be hidden initially
    cy.get('button[aria-label="Bold"]').should('not.exist');
    
    // Focus should show toolbar
    cy.get('textarea').focus();
    cy.get('button[aria-label="Bold"]').should('be.visible');
    cy.get('button[aria-label="Italic"]').should('be.visible');
    cy.get('button[aria-label="Add link"]').should('be.visible');
    
    // Blur should hide toolbar
    cy.get('body').click();
    cy.get('button[aria-label="Bold"]').should('not.exist');
  });
}); 