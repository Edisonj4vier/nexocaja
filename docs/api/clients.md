# API: Clientes (`/clients`)

## Resumen
Gestión de clientes bancarios (dueños de cuentas).

## Endpoints

- **`POST /api/clients`**: Registra cliente. (Roles: `ADMIN`, `CASHIER`)
- **`GET /api/clients`**: Lista paginada. Búsqueda por nombre/cédula. (Roles: `ADMIN`, `CASHIER`)
- **`GET /api/clients/:id`**: Detalles del cliente y sus cuentas asociadas. (Roles: `ADMIN`, `CASHIER`)
- **`PATCH /api/clients/:id`**: Actualización de datos. (Rol: `ADMIN`)
