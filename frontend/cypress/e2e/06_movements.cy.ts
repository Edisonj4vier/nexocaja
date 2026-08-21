describe('6. Movimientos (Depósitos y Retiros)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/movements');
  });

  it('6.1 — Visualizar tabla de movimientos e historial', () => {
    cy.contains('Movimientos').should('be.visible');
    cy.contains('button', 'Depósito').should('be.visible');
    cy.contains('button', 'Retiro').should('be.visible');
  });

  it('6.2 — Filtrar movimientos por tipo', () => {
    cy.get('button[role="combobox"]').click({ force: true });
    cy.contains('[role="option"]', 'Depósitos').click({ force: true });
    cy.get('table').should('be.visible');
  });

  it('6.3 — Permite escribir en los campos de entrada de forma continua sin perder el foco', () => {
    // Abrir diálogo de depósito
    cy.contains('button', 'Depósito').click({ force: true });
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Registrar Depósito').should('be.visible');

    // Escribir número de cuenta completo de forma secuencial
    const testAccountNumber = '8885400285';
    cy.get('[role="dialog"] input#accountSearchInput')
      .should('be.visible')
      .type(testAccountNumber, { delay: 40, force: true })
      .should('have.value', testAccountNumber);

    // Buscar la cuenta pulsando Enter
    cy.get('[role="dialog"] input#accountSearchInput').type('{enter}', { force: true });

    // Esperar respuesta de búsqueda
    cy.wait(1000);

    // Si encuentra la cuenta o si el input de monto está habilitado, escribir monto y observaciones de corrido
    cy.get('body').then(($body) => {
      if ($body.find('[role="dialog"] input#amountInput:not([disabled])').length > 0) {
        cy.get('[role="dialog"] input#amountInput')
          .type('150.50', { delay: 40, force: true })
          .should('have.value', '150.50');

        cy.get('[role="dialog"] input#obsInput')
          .type('Prueba continua de escritura y foco en QA', { delay: 20, force: true })
          .should('have.value', 'Prueba continua de escritura y foco en QA');
      }
    });

    // Cerrar modal con botón Cancelar
    cy.get('[role="dialog"] button').contains('Cancelar').click({ force: true });
    cy.get('[role="dialog"]').should('not.exist');
  });
});
