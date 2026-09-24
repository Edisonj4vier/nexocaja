describe('4. Gestión de Cuentas y Libretas de Ahorro', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/app/accounts');
  });

  it('4.1 — Listar cuentas de ahorro existentes y catálogo', () => {
    cy.contains('Cuentas y Libretas Financieras').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('button', 'Apertura de Cuenta').should('be.visible');
  });

  it('4.2 — Apertura de cuenta guiada para un socio con producto financiero', () => {
    cy.contains('button', 'Apertura de Cuenta').click({ force: true });
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Apertura de Cuenta Financiera').should('be.visible');

    // Paso 1: Buscar y seleccionar socio existente
    cy.get('[role="dialog"] input[placeholder*="Ej. 1712345678"]').type('17', { force: true });
    cy.contains('[role="dialog"] div', 'Seleccionar', { timeout: 8000 }).first().click({ force: true });
    cy.contains('[role="dialog"] button', 'Siguiente').click({ force: true });

    // Paso 2: Seleccionar producto de ahorro del catálogo
    cy.contains('Selecciona el Producto Financiero').should('be.visible');
    cy.get('[role="dialog"]').contains('h4', 'Cuenta de Ahorros Básica').click({ force: true });
    cy.contains('[role="dialog"] button', 'Siguiente').click({ force: true });

    // Paso 3: Saldo de apertura y confirmación
    cy.get('[role="dialog"] input[name="openingAmount"]').clear({ force: true }).type('25.00', { force: true });
    cy.contains('[role="dialog"] button', 'Aperturar Cuenta').click({ force: true });

    // La tabla debe actualizarse y listar la cuenta aperturada
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
  });
});
