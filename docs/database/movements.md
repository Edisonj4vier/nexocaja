# Entidad: Movement (Movimientos)

Representa cada transacción financiera que mueve dinero.

## Campos Principales
- `id`: UUID único.
- `type`: Enum (`DEPOSIT`, `WITHDRAWAL`).
- `amount`: Valor de la transacción. Tipo `Decimal(12, 2)`.
- `accountId`: Cuenta de ahorros que recibe o envía el dinero.
- `cashRegisterId`: Caja (turno) donde se operó el movimiento.
- `userId`: Empleado que procesó la transacción.
- `observations`: Comentarios opcionales (ej: "Depósito cheque #123").

## Relaciones
- Pertenece a una `Account`.
- Pertenece a un `User`.
- Pertenece a una `CashRegister`.

> **Importante:** Cada registro aquí se inserta utilizando `prisma.$transaction` en conjunto con el campo `balance` de la tabla `Account`, asegurando que el dinero siempre cuadre (Atomicidad).
