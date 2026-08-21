describe('5. Caja Registradora', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/cash-register');
  });

  it('5.1 — Visualizar módulo de caja (abierta o cerrada)', () => {
    cy.contains('Caja Registradora').should('be.visible');
    cy.get('body').then(($body) => {
      if ($body.text().includes('No hay una caja abierta')) {
        cy.contains('button', 'Abrir Caja').should('be.visible');
      } else {
        cy.contains('Caja Abierta').should('be.visible');
        cy.contains('Saldo Inicial').should('be.visible');
      }
    });
  });

  it('5.2 — Abrir caja si se encuentra cerrada', () => {
    cy.get('body').then(($body) => {
      if ($body.text().includes('No hay una caja abierta')) {
        cy.contains('button', 'Abrir Caja').click({ force: true });
        cy.get('input#openingBalance').clear({ force: true }).type('500.00', {
          force: true,
        });
        cy.get('input#openObservations').type('Apertura Cypress E2E', {
          force: true,
        });
        cy.get('[role="dialog"] button')
          .contains('Abrir Caja')
          .click({ force: true });

        cy.contains('Caja Abierta', { timeout: 8000 }).should('be.visible');
        cy.contains('$500.00').should('be.visible');
      }
    });
  });
});
