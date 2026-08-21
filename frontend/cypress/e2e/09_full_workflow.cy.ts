describe('9. Flujo Integral de Negocio (Full Journey E2E)', () => {
  const uniqueId = Date.now().toString().slice(-4);
  const testCedula = `09${uniqueId}5544`;

  it('9.1 — Flujo completo de ciclo de vida de operaciones en NexoCaja', () => {
    // 1. Iniciar sesión como Admin
    cy.visit('/login');
    cy.get('input#email').type('admin@nexocaja.local');
    cy.get('input#password').type('Admin123*');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    // 2. Registrar un nuevo cliente
    cy.visit('/clients');
    cy.contains('button', 'Nuevo Cliente').click({ force: true });
    cy.get('[role="dialog"]').should('be.visible');

    cy.get('[role="dialog"] input[name="identificationNumber"]').type(testCedula, { force: true });
    cy.get('[role="dialog"] input[name="firstName"]').type('Santiago', { force: true });
    cy.get('[role="dialog"] input[name="lastName"]').type('Guerrero', { force: true });
    cy.get('[role="dialog"] input[name="phone"]').type('0987112233', { force: true });
    cy.get('[role="dialog"] input[name="email"]').type(`santiago.${uniqueId}@caja.ec`, { force: true });

    cy.get('[role="dialog"] button[role="combobox"]').click({ force: true });
    cy.get('[role="option"]').contains('Cédula').click({ force: true });

    cy.get('[role="dialog"] button[type="submit"]').click({ force: true });

    // Validar cliente en lista
    cy.contains(testCedula, { timeout: 8000 }).should('be.visible');

    // 3. Abrir cuenta de ahorros
    cy.visit('/accounts');
    cy.contains('button', 'Abrir Cuenta').click({ force: true });
    cy.contains('Abrir Nueva Cuenta').should('be.visible');
    cy.get('button[role="combobox"]').click({ force: true });
    cy.get('[role="option"]').first().click({ force: true });
    cy.get('[role="dialog"] button').contains('Abrir Cuenta').click({ force: true });

    // Validar cuenta en tabla
    cy.get('table tbody tr', { timeout: 8000 }).should('have.length.at.least', 1);

    // 4. Verificar o Abrir Caja
    cy.visit('/cash-register');
    cy.get('body').then(($body) => {
      if ($body.text().includes('No hay una caja abierta')) {
        cy.contains('button', 'Abrir Caja').click({ force: true });
        cy.get('input#openingBalance').clear({ force: true }).type('1000.00', { force: true });
        cy.get('[role="dialog"] button').contains('Abrir Caja').click({ force: true });
        cy.contains('Caja Abierta', { timeout: 8000 }).should('be.visible');
      }
    });

    // 5. Consultar Centro de Reportes
    cy.visit('/reports');
    cy.contains('Centro de Reportes').should('be.visible');
    cy.contains('button', 'Movimientos').should('be.visible');
    cy.contains('button', 'Consultar').click({ force: true });
    cy.contains('Vista Previa del Reporte').should('be.visible');

    // 6. Validar Dashboard actualizado
    cy.visit('/');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Total Clientes').should('be.visible');
    cy.contains('Cuentas Activas').should('be.visible');
  });
});
