describe('Health Check', () => {
  it('should return health status', () => {
    cy.api('GET', '/api/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
    });
  });

  it('should handle non-existent endpoints', () => {
    cy.api('GET', '/api/nonexistent').then((response) => {
      expect(response.status).to.eq(404);
    });
  });
}); 