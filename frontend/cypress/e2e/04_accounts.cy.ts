describe('4. Gestión de Cuentas de Ahorro', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/accounts');
  });

  it('4.1 — Listar cuentas de ahorro existentes', () => {
    cy.contains('Gestión de Cuentas').should('be.visible');
    cy.get('table').should('be.visible');
  });

  it('4.2 — Abrir nueva cuenta para un cliente', () => {
    cy.contains('button', 'Abrir Cuenta').click();
    cy.contains('Abrir Nueva Cuenta').should('be.visible');

    // Select first client available in the dropdown
    cy.get('button[role="combobox"]').click({ force: true });
    cy.get('[role="option"]').first().click({ force: true });

    cy.get('[role="dialog"] button').contains('Abrir Cuenta').click();

    // Table should refresh and show accounts
    cy.get('table tbody tr', { timeout: 8000 }).should('have.length.at.least', 1);
  });
});
