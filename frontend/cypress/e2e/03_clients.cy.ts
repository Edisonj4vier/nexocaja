describe('3. Padrón de Clientes', () => {
  const uniqueId = Date.now().toString().slice(-4);
  const testId = `17${uniqueId}9988`;

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/clients');
  });

  it('3.1 — Mostrar lista de clientes y barra de búsqueda', () => {
    cy.contains('Gestión de Clientes').should('be.visible');
    cy.get('input[placeholder*="Buscar"]').should('be.visible');
    cy.get('table').should('be.visible');
  });

  it('3.2 — Registrar un nuevo cliente', () => {
    cy.contains('button', 'Nuevo Cliente').click({ force: true });
    cy.get('[role="dialog"]').should('be.visible');

    // Fill textual fields with force
    cy.get('[role="dialog"] input[name="identificationNumber"]').type(testId, { force: true });
    cy.get('[role="dialog"] input[name="firstName"]').type('Fernando', { force: true });
    cy.get('[role="dialog"] input[name="lastName"]').type('Morales', { force: true });
    cy.get('[role="dialog"] input[name="phone"]').type('0998877665', { force: true });
    cy.get('[role="dialog"] input[name="email"]').type(`fernando.${uniqueId}@email.com`, { force: true });
    cy.get('[role="dialog"] input[name="address"]').type('Calle Principal 456', { force: true });

    // Select identificationType with force
    cy.get('[role="dialog"] button[role="combobox"]').click({ force: true });
    cy.get('[role="option"]').contains('Cédula').click({ force: true });

    cy.get('[role="dialog"] button[type="submit"]').click({ force: true });

    // Verify client appears in table
    cy.contains(testId, { timeout: 8000 }).should('be.visible');
    cy.contains('Fernando Morales').should('be.visible');
  });

  it('3.3 — Búsqueda en tiempo real por número de identificación', () => {
    cy.get('input[placeholder*="Buscar"]').clear().type(testId);
    cy.contains(testId, { timeout: 5000 }).should('be.visible');
    cy.contains('Fernando Morales').should('be.visible');
  });

  it('3.4 — Ver detalle del cliente y sus cuentas', () => {
    cy.get('input[placeholder*="Buscar"]').clear().type(testId);
    cy.contains('tr', testId).within(() => {
      cy.get('button').click({ force: true });
    });
    cy.contains('[role="menuitem"]', 'Ver Detalle').click({ force: true });

    cy.contains('Detalle del Cliente').should('be.visible');
    cy.contains('Fernando Morales').should('be.visible');
    cy.contains(testId).should('be.visible');
  });
});
