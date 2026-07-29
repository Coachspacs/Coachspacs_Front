describe('CoachSpace LMS Home Page', () => {
  it('should load home page and display title correctly in Arabic & English', () => {
    cy.visit('/ar');
    cy.contains('CoachSpace');
    cy.contains('استكشف الدورات');

    cy.visit('/en');
    cy.contains('Explore Courses');
  });
});
