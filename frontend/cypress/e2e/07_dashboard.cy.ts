describe('7. Dashboard en Tiempo Real', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/');
  });

  it('7.1 — Cargar tarjetas de KPIs financieros', () => {
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Total Clientes').should('be.visible');
    cy.contains('Cuentas Activas').should('be.visible');
    cy.contains('Saldo en Caja').should('be.visible');
    cy.contains('Depósitos Hoy').should('be.visible');
    cy.contains('Retiros Hoy').should('be.visible');
  });

  it('7.2 — Botón de refresco manual de datos', () => {
    cy.contains('button', 'Actualizar').should('be.visible').click();
  });

  it('7.3 — Sección de Últimos Movimientos', () => {
    cy.contains('Últimos Movimientos').should('be.visible');
  });
});
