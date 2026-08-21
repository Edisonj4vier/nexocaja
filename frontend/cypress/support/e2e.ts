// ***********************************************************
// This example support/e2e.ts is processed and loaded automatically before your test files.
// ***********************************************************

import './commands';

// Prevent uncaught exceptions from failing tests (e.g. 3rd party scripts)
Cypress.on('uncaught:exception', (_err, _runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});
