describe('11. Estado de Cuenta y Boucher Oficiales', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('11.1 — Columna de Comprobante / Boucher visible en Movimientos', () => {
    cy.visit('/movements');
    cy.contains('Movimientos').should('be.visible');
    cy.contains('th', 'Comprobante').should('be.visible');

    // If there is any movement in the table, test opening the voucher
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr').length > 0 && $body.find('button:contains("Boucher")').length > 0) {
        cy.get('button:contains("Boucher")').first().click({ force: true });
        cy.get('[role="dialog"]').should('be.visible');
        cy.contains('NexoCaja').should('be.visible');
        cy.contains(/comprobante/i).should('be.visible');
        cy.contains(/Verificar la transacción con este QR/i).should('be.visible');
        cy.contains('button', 'Imprimir').should('be.visible');
        cy.contains('button', 'Descargar PDF').should('be.visible');
        cy.contains('button', 'Cerrar').click({ force: true });
        cy.get('[role="dialog"]').should('not.exist');
      }
    });
  });

  it('11.2 — Botón de Estado de Cuenta y diálogo oficial en Detalle de Cuenta', () => {
    cy.visit('/app/accounts');
    cy.contains('Cuentas y Libretas Financieras').should('be.visible');

    // Click the account number cell in the first row to navigate to account detail
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('table tbody tr').first().find('td').eq(1).find('.cursor-pointer').click({ force: true });
    cy.url({ timeout: 10000 }).should('match', /\/app\/accounts\/[a-zA-Z0-9-]+/);

    // Check Estado de Cuenta button in financial card
    cy.contains('button', 'Estado de Cuenta').should('be.visible').click({ force: true });

    // Verify AccountStatementDialog opened
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Estado de Cuenta Oficial').should('be.visible');
    cy.contains('COOP. NEXOCAJA LTDA.').should('be.visible');
    cy.contains('ESTADO DE CUENTA').should('be.visible');
    cy.contains(/SALDO ANTERIOR:/i).should('be.visible');
    cy.contains(/SALDO ACTUAL:/i).should('be.visible');
    cy.contains(/Producto PROTEGIDO/i).scrollIntoView().should('be.visible');
    cy.contains('button', 'Imprimir').should('be.visible');
    cy.contains('button', 'Descargar PDF Oficial').should('be.visible');
  });
});
