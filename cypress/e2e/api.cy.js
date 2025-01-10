describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('should return health status', () => {
      cy.request('/api/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'ok');
        expect(response.body).to.have.property('timestamp');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', () => {
      cy.request({
        method: 'POST',
        url: '/api/users/profile',
        body: 'not-json',
        failOnStatusCode: false,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });
}); 