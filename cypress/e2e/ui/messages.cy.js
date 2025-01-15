describe('Message Functionality', () => {
  beforeEach(() => {
    // Start at home page
    cy.visit('/');
    
    // Enter guest name and submit
    cy.get('input[placeholder*="guest name"]').type('TestUser');
    cy.get('button').contains('Join as Guest').click();
    
    // Should be redirected to /channel/general
    cy.url().should('include', '/channel/general');
    
    // Wait for message list to be ready (either empty or loaded)
    cy.get('[data-testid="message-list-empty"], [data-testid="message-list-loaded"]').should('exist');
    cy.get('textarea').should('exist');
  });

  it('should display messages after sending them', () => {
    // Wait for message list to be loaded
    cy.get('[data-testid="message-list-loaded"]').should('exist');
    
    // Get initial message count
    let initialCount;
    cy.get('[data-testid="message-list-loaded"]')
      .find('[data-testid="message-content"]')
      .then($messages => {
        initialCount = $messages.length;
      });

    // Send first message
    const firstMessage = 'Hello, this is a test message!';
    cy.get('textarea').type(firstMessage);
    cy.get('button[aria-label="Send message"]').click();
    
    // Send second message
    const secondMessage = 'And here is another test message!';
    cy.get('textarea').should('be.visible');
    cy.get('textarea').type(secondMessage);
    cy.get('button[aria-label="Send message"]').click();
    
    // Verify messages in the list
    cy.get('[data-testid="message-list-loaded"]').within(() => {
      // Verify two new messages were added
      cy.get('[data-testid="message-content"]').should('have.length', initialCount + 2);
      
      // Verify message contents
      cy.get('[data-testid="message-content"]')
        .last()
        .should('contain', secondMessage);
      
      cy.get('[data-testid="message-content"]')
        .eq(-2)
        .should('contain', firstMessage);
    });
  });

  it('should handle long messages and special characters', () => {
    // Wait for message input to be ready and interactive
    cy.get('textarea').should('be.visible').should('be.enabled');
    
    // Test long message
    const longMessage = 'This is a very long message that tests how the chat handles lengthy content. It should wrap properly and display correctly without breaking the layout or causing any visual issues.';
    cy.get('textarea').should('be.visible');
    cy.get('textarea').type(longMessage);
    cy.get('button[aria-label="Send message"]').click();

    // Wait for message list to be loaded and verify long message
    cy.get('[data-testid="message-list-loaded"]').should('exist');
    cy.get('[data-testid="message-list-loaded"]').contains(longMessage).should('be.visible');

    // Test message with special characters
    const specialMessage = '¡Hola! 你好 🎉 @user #channel';
    cy.get('textarea').should('be.visible');
    cy.get('textarea').type(specialMessage);
    cy.get('button[aria-label="Send message"]').click();

    // Verify special characters message appears correctly
    cy.get('[data-testid="message-list-loaded"]').contains(specialMessage).should('be.visible');
  });
}); 