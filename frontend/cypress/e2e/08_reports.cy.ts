describe('8. Centro de Reportes', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/reports');
  });

  it('8.1 — Cargar interfaz del Centro de Reportes', () => {
    cy.contains('Centro de Reportes').should('be.visible');
    cy.contains('button', 'Movimientos').should('be.visible');
    cy.contains('button', 'Clientes').should('be.visible');
    cy.contains('button', 'Cuentas').should('be.visible');
    cy.contains('button', 'Cajas').should('be.visible');
  });

  it('8.2 — Cambiar de tipo de reporte y previsualizar', () => {
    cy.contains('button', 'Clientes').click({ force: true });
    cy.contains('button', 'Consultar').click({ force: true });
    cy.contains('Vista Previa del Reporte').should('be.visible');
  });

  it('8.3 — Botones de exportación Excel y PDF visibles y funcionales', () => {
    cy.contains('button', 'Exportar Excel (.xlsx)').should('be.visible');
    cy.contains('button', 'Exportar PDF (.pdf)').should('be.visible');
  });
});
