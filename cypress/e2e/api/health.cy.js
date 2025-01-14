describe('Health Check', () => {
  it('should return health status and log database info', () => {
    cy.api('GET', '/api/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
      expect(response.body.database).to.have.property('status');
      expect(response.body.database).to.have.property('name');
      expect(response.body.database).to.have.property('environment', 'test');
      
      // Log database information
      cy.log('🔍 Database Info:', {
        name: response.body.database.name,
        status: response.body.database.status,
        env: response.body.database.environment
      });

      // Verify we're using the test database
      expect(response.body.database.name).to.include('chatgenius_test');
    });
  });

  it('should handle non-existent endpoints', () => {
    cy.api('GET', '/api/nonexistent').then((response) => {
      expect(response.status).to.eq(404);
    });
  });
}); 