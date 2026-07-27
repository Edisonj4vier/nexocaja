# Entidad: Account (Cuentas)

Representa la cuenta bancaria / caja de ahorro de un cliente.

## Campos Principales
- `id`: UUID único.
- `accountNumber`: Número autogenerado de 10 dígitos (único).
- `balance`: Saldo actual de la cuenta. Tipo `Decimal(12, 2)` (Precisión financiera).
- `status`: Enum (`ACTIVE`, `INACTIVE`).
- `clientId`: Referencia al dueño de la cuenta.

## Relaciones
- Pertenece a un `Client`.
- Tiene muchos `Movement` (Depósitos y retiros hechos a esta cuenta).
