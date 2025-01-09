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

  describe('Users API', () => {
    it('should list users', () => {
      cy.request('/api/users').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });
}); 