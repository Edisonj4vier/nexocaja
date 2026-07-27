# API: Movimientos (`/movements`)

## Resumen
Transacciones financieras. *Requiere que el cajero tenga una caja abierta.*

## Endpoints

- **`POST /api/movements/deposit`**: Registra depósito en una cuenta. Aumenta el saldo. (Roles: `ADMIN`, `CASHIER`)
- **`POST /api/movements/withdrawal`**: Registra retiro (valida saldo suficiente). Reduce el saldo. (Roles: `ADMIN`, `CASHIER`)
- **`GET /api/movements`**: Historial de movimientos filtrable (por tipo o ID de cuenta). (Roles: `ADMIN`, `CASHIER`)
