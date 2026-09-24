describe('9. Flujo Integral de Negocio (Full Journey E2E)', () => {
  const uniqueId = Date.now().toString().slice(-4);
  const testCedula = `09${uniqueId}5544`;

  it('9.1 — Flujo completo de ciclo de vida de operaciones en NexoCaja', () => {
    // 1. Iniciar sesión como Admin
    cy.visit('/login');
    cy.get('input#email').type('admin@nexocaja.local');
    cy.get('input#password').type('Admin123*');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');

    // 2. Registrar un nuevo socio (Asistente 4 Pasos)
    cy.visit('/app/clients');
    cy.contains('button', 'Registrar Socio').click({ force: true });
    cy.get('[role="dialog"]').should('be.visible');

    // Paso 1
    cy.get('[role="dialog"] input[name="identificationNumber"]').type(testCedula, { force: true });
    cy.get('[role="dialog"] input[name="firstName"]').type('Santiago', { force: true });
    cy.get('[role="dialog"] input[name="lastName"]').type('Guerrero', { force: true });
    cy.contains('[role="dialog"] button', 'Siguiente').click({ force: true });

    // Paso 2
    cy.get('[role="dialog"] input[name="phone"]').type('0987112233', { force: true });
    cy.get('[role="dialog"] input[name="email"]').type(`santiago.${uniqueId}@caja.ec`, { force: true });
    cy.contains('[role="dialog"] button', 'Siguiente').click({ force: true });

    // Paso 3
    cy.contains('[role="dialog"] button', 'Siguiente').click({ force: true });

    // Paso 4: Guardar
    cy.contains('[role="dialog"] button', 'Registrar Socio').click({ force: true });

    // Validar socio en lista
    cy.contains(testCedula, { timeout: 10000 }).should('be.visible');

    // 3. Abrir cuenta de ahorros guiada
    cy.visit('/app/accounts');
    cy.contains('button', 'Apertura de Cuenta').click({ force: true });
    cy.get('[role="dialog"]').should('be.visible');

    // Paso 1: Buscar por cédula del socio recién registrado
    cy.get('[role="dialog"] input[placeholder*="Ej. 1712345678"]').type(testCedula, { force: true });
    cy.contains('[role="dialog"] div', 'Seleccionar', { timeout: 8000 }).click({ force: true });
    cy.contains('[role="dialog"] button', 'Siguiente').click({ force: true });

    // Paso 2: Seleccionar producto
    cy.get('[role="dialog"]').contains('h4', 'Cuenta de Ahorros Básica').click({ force: true });
    cy.contains('[role="dialog"] button', 'Siguiente').click({ force: true });

    // Paso 3: Saldo y apertura
    cy.get('[role="dialog"] input[name="openingAmount"]').clear({ force: true }).type('50.00', { force: true });
    cy.contains('[role="dialog"] button', 'Aperturar Cuenta').click({ force: true });

    // Validar cuenta en tabla
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);

    // 4. Verificar o Abrir Caja
    cy.visit('/app/cash-register');
    cy.get('body').then(($body) => {
      if ($body.text().includes('No hay una caja abierta') || $body.text().includes('Abrir Caja')) {
        cy.contains('button', 'Abrir Caja').click({ force: true });
        cy.get('input#openingBalance').clear({ force: true }).type('1000.00', { force: true });
        cy.get('[role="dialog"] button').contains('Abrir Caja').click({ force: true });
        cy.contains('Caja Abierta', { timeout: 8000 }).should('be.visible');
      }
    });

    // 5. Consultar Centro de Reportes
    cy.visit('/app/reports');
    cy.contains('Centro de Reportes').should('be.visible');
    cy.contains('button', 'Movimientos').should('be.visible');
    cy.contains('button', 'Consultar').click({ force: true });
    cy.contains('Vista Previa del Reporte').should('be.visible');

    // 6. Validar Dashboard actualizado
    cy.visit('/app/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });
});
