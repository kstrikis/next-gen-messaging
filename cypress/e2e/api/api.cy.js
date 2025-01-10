describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('should return health status', () => {
      cy.api('GET', '/api/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'ok');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', () => {
      cy.api('POST', '/api/messages', {
        body: 'not-json',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });
}); 