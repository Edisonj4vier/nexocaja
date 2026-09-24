describe('3. Padrón de Socios y Ficha 360°', () => {
  const uniqueId = Date.now().toString().slice(-4);
  const testId = `17${uniqueId}9988`;

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/app/clients');
  });

  it('3.1 — Mostrar directorio de socios y barra de herramientas', () => {
    cy.contains('Directorio de Socios').should('be.visible');
    cy.get('input[placeholder*="Buscar"]').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('button', 'Registrar Socio').should('be.visible');
  });

  it('3.2 — Registrar un nuevo socio mediante el asistente de 4 pasos', () => {
    cy.contains('button', 'Registrar Socio').click({ force: true });
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('Registro de Nuevo Socio').should('be.visible');

    // Paso 1: Datos Personales
    cy.get('[role="dialog"] input[name="identificationNumber"]').type(testId, { force: true });
    cy.get('[role="dialog"] input[name="firstName"]').type('Fernando', { force: true });
    cy.get('[role="dialog"] input[name="lastName"]').type('Morales', { force: true });
    cy.get('[role="dialog"]').contains('button', 'Siguiente').click({ force: true });

    // Paso 2: Contacto y Residencia
    cy.get('[role="dialog"] input[name="phone"]').type('0998877665', { force: true });
    cy.get('[role="dialog"] input[name="email"]').type(`fernando.${uniqueId}@email.com`, { force: true });
    cy.get('[role="dialog"] input[name="address"]').type('Av. de los Shyris 123', { force: true });
    cy.get('[role="dialog"]').contains('button', 'Siguiente').click({ force: true });

    // Paso 3: Actividad Económica
    cy.get('[role="dialog"]').contains('button', 'Siguiente').click({ force: true });

    // Paso 4: Vinculación Comunitaria & Guardar
    cy.get('[role="dialog"]').contains('button', 'Registrar Socio').click({ force: true });

    // Verificar que el socio aparece en la tabla con su código y datos
    cy.contains(testId, { timeout: 10000 }).should('be.visible');
    cy.contains('Morales Fernando').should('be.visible');
  });

  it('3.3 — Búsqueda en tiempo real por número de identificación y barra de paginación', () => {
    cy.get('input[placeholder*="Buscar"]').clear().type(testId);
    cy.contains(testId, { timeout: 8000 }).should('be.visible');
    cy.contains('Morales Fernando').should('be.visible');
    cy.contains('Total:').should('be.visible');
  });

  it('3.4 — Navegar al Expediente Integral 360° del socio', () => {
    cy.get('input[placeholder*="Buscar"]').clear().type(testId);
    cy.contains('tr', testId, { timeout: 8000 }).within(() => {
      cy.get('button').click({ force: true });
    });
    cy.contains('[role="menuitem"]', 'Ver Ficha 360°').click({ force: true });

    cy.url({ timeout: 8000 }).should('include', '/app/clients/');
    cy.contains('Volver al Directorio de Socios').should('be.visible');
    cy.contains('Morales Fernando').should('be.visible');
    cy.contains(testId).should('be.visible');
    cy.contains('Cuentas y Productos').should('be.visible');
  });
});
