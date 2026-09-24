describe('10. Flujo Integral: Socio 360° -> Ventanilla (Depósito Automático)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('10.1 — Asegurar caja registradora abierta para operaciones', () => {
    cy.intercept('GET', '**/api/cash-registers/current').as('getCashRegister');
    cy.visit('/app/cash-register');
    cy.wait('@getCashRegister');

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Abrir Caja")').length > 0) {
        cy.contains('button', 'Abrir Caja').click({ force: true });
        cy.get('input#openingBalance').clear({ force: true }).type('200.00', { force: true });
        cy.get('[role="dialog"] button').contains('Abrir Caja').click({ force: true });
        cy.contains('Caja Abierta', { timeout: 10000 }).should('be.visible');
      } else {
        cy.contains('Caja Abierta').should('be.visible');
      }
    });
  });

  it('10.2 — Desde el expediente 360° del socio, accionar Operar en Ventanilla y registrar depósito', () => {
    // 1. Ir a cuentas para tomar un número de cuenta activo existente
    cy.visit('/app/accounts');
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);

    // Tomamos el número de cuenta de 12 dígitos de la columna Nro. Cuenta (columna 1)
    cy.get('table tbody tr').first().find('td').eq(1).find('span.font-mono').invoke('text').then((accountText) => {
      const accountNumber = accountText.trim();
      expect(accountNumber).to.match(/^2101\d{8}$/);

      // 2. Interceptar el depósito y visitar ventanilla con el número de cuenta
      cy.intercept('POST', '**/api/movements/deposit').as('depositReq');
      cy.visit(`/app/movements?account=${accountNumber}&action=deposit`);

      // El diálogo de depósito debe abrirse automáticamente
      cy.get('[role="dialog"]', { timeout: 8000 }).should('be.visible');
      cy.contains('Registrar Depósito').should('be.visible');

      // El input de cuenta debe tener la cuenta pre-rellenada
      cy.get('input#accountSearchInput').should('have.value', accountNumber);

      // Esperar a que la cuenta sea encontrada y confirmada en el diálogo
      cy.contains('Cuenta Titular:', { timeout: 8000 }).should('be.visible');

      // Ingresar monto
      cy.get('input#amountInput').clear({ force: true }).type('15.00', { force: true });

      // Confirmar depósito
      cy.get('[role="dialog"] button[type="submit"]').click({ force: true });
      cy.wait('@depositReq').its('response.statusCode').should('eq', 201);

      // El comprobante / boucher digital se genera automáticamente
      cy.contains(/¡Depósito exitoso!/i, { timeout: 8000 }).should('be.visible');
      cy.contains('button', 'Cerrar').click({ force: true });
      cy.get('[role="dialog"]', { timeout: 8000 }).should('not.exist');
      cy.contains(accountNumber, { timeout: 10000 }).should('be.visible');
      cy.contains('+$15.00').should('be.visible');
    });
  });
});
