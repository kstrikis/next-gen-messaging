describe('Health Check', () => {
  it('should return health status', () => {
    cy.request('/api/health')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'ok');
        expect(response.body).to.have.property('timestamp');
      });
  });

  it('should handle non-existent endpoints', () => {
    cy.request({
      url: '/api/nonexistent',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
}); 