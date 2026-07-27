# API: Caja (`/cash-registers`)

## Resumen
Apertura y cierre de turnos de caja para los cajeros.

## Endpoints

- **`POST /api/cash-registers/open`**: Abre caja con un monto base (`openingBalance`). Valida que el cajero no tenga otra caja abierta. (Roles: `ADMIN`, `CASHIER`)
- **`POST /api/cash-registers/close`**: Cierra la caja actual y calcula automáticamente los totales. (Roles: `ADMIN`, `CASHIER`)
- **`GET /api/cash-registers/current`**: Obtiene la caja activa del usuario y sus últimos 10 movimientos. (Roles: `ADMIN`, `CASHIER`)
