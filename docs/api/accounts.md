# API: Cuentas (`/accounts`)

## Resumen
Gestión de cuentas de ahorro vinculadas a los clientes.

## Endpoints

- **`POST /api/accounts`**: Apertura una cuenta. El servidor genera un número único de 10 dígitos. (Roles: `ADMIN`, `CASHIER`)
- **`GET /api/accounts`**: Lista paginada. Filtros por estado, número de cuenta o cliente. (Roles: `ADMIN`, `CASHIER`)
- **`GET /api/accounts/:id`**: Detalles de la cuenta, dueño y saldo actual. (Roles: `ADMIN`, `CASHIER`)
- **`PATCH /api/accounts/:id/status`**: Cambia el estado (Activo/Inactivo). (Rol: `ADMIN`)
