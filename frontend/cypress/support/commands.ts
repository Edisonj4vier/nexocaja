/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    loginAsAdmin(): Chainable<void>;
    logout(): Chainable<void>;
  }
}

// Custom login command via UI
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input#email').clear().type(email);
  cy.get('input#password').clear().type(password);
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should('not.include', '/login');
});

// Shortcut for admin login
Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin@nexocaja.local', 'Admin123*');
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('button[title="Cerrar sesión"]').click();
  cy.url({ timeout: 10000 }).should('include', '/login');
});
