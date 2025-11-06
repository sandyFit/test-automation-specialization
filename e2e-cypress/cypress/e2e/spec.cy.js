describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io');

    cy.get('h1')
      .invoke('text')
      .should('equal', 'Kitchen Sink');
  });

  it('finds the content "type"', () => {
    cy.visit('https://example.cypress.io');
    cy.contains('type');
  })
})
