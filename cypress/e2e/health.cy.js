describe('Health Check', () => {
  it('should return health status', () => {
    cy.request('GET', 'http://localhost:3001/api/health')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'ok');
        expect(response.body).to.have.property('timestamp');
      });
  });

  it('should list users', () => {
    cy.request('GET', 'http://localhost:3001/api/users')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
  });
}); 