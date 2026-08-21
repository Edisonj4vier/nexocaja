describe('1. Autenticación y Control de Acceso', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('1.1 — Muestra el formulario de inicio de sesión correctamente', () => {
    cy.contains('NexoCaja').should('be.visible');
    cy.contains('Ingresa tus credenciales para acceder').should('be.visible');
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Iniciar Sesión');
  });

  it('1.2 — Login fallido con credenciales incorrectas', () => {
    cy.get('input#email').type('admin@nexocaja.local');
    cy.get('input#password').type('WrongPassword123');
    cy.get('button[type="submit"]').click();

    cy.contains(/Credenciales|Error|inválid/i, { timeout: 8000 }).should(
      'be.visible',
    );
  });

  it('1.3 — Login exitoso de Administrador y redirección a Dashboard', () => {
    cy.get('input#email').type('admin@nexocaja.local');
    cy.get('input#password').type('Admin123*');
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Bienvenido, Admin').should('be.visible');
    cy.contains('ADMIN').should('be.visible');
  });

  it('1.4 — Cierre de sesión (Logout) redirige a /login', () => {
    cy.loginAsAdmin();
    cy.get('button[title="Cerrar sesión"]').click();

    cy.url().should('include', '/login');
    cy.get('input#email').should('be.visible');
  });

  it('1.5 — Rutas protegidas redirigen al login si no hay sesión', () => {
    cy.visit('/users');
    cy.url().should('include', '/login');

    cy.visit('/clients');
    cy.url().should('include', '/login');

    cy.visit('/cash-register');
    cy.url().should('include', '/login');
  });
});
