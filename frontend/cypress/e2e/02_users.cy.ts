describe('2. Gestión de Usuarios y Roles', () => {
  const uniqueId = Date.now().toString().slice(-4);
  const testEmail = `cajera.cy${uniqueId}@nexocaja.local`;

  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/users');
  });

  it('2.1 — Listar usuarios existentes', () => {
    cy.contains('Gestión de Usuarios').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('admin@nexocaja.local').should('be.visible');
  });

  it('2.2 — Crear nuevo usuario Cajero', () => {
    cy.contains('button', 'Nuevo Usuario').click();
    cy.contains('Crear Usuario').should('be.visible');

    cy.get('input[name="firstName"]').type('Lorena');
    cy.get('input[name="lastName"]').type('Vargas');
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type('Cajera123*');

    // Select role CASHIER with { force: true }
    cy.get('button[role="combobox"]').click({ force: true });
    cy.contains('[role="option"]', 'CASHIER').click({ force: true });

    cy.get('button').contains('Guardar').click();

    // Verify cashier appears in table
    cy.contains(testEmail, { timeout: 8000 }).should('be.visible');
    cy.contains('Lorena Vargas').should('be.visible');
  });

  it('2.3 — Validar que el nuevo cajero pueda iniciar sesión y tenga RBAC aplicado', () => {
    cy.logout();
    cy.login(testEmail, 'Cajera123*');

    cy.contains('Bienvenido, Lorena Vargas').should('be.visible');
    cy.contains('CASHIER').should('be.visible');

    // Verify "Usuarios" menu is hidden for CASHIER
    cy.get('nav').should('not.contain', 'Usuarios');
  });
});
