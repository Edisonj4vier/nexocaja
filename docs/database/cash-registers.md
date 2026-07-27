# Entidad: CashRegister (Caja)

Representa un "turno de caja" iniciado por un empleado.

## Campos Principales
- `id`: UUID único.
- `userId`: Referencia al cajero responsable.
- `openingBalance`: Efectivo inicial con el que empezó a trabajar. Tipo `Decimal(12, 2)`.
- `closingBalance`: Efectivo final calculado al cerrar. Tipo `Decimal(12, 2)`.
- `status`: Enum (`OPEN`, `CLOSED`). Un usuario solo puede tener un registro abierto.
- `openedAt`, `closedAt`: Tiempos exactos de apertura y cierre.

## Relaciones
- Pertenece a un `User` (el cajero).
- Tiene muchos `Movement` (todas las transacciones que pasaron por esa caja física).
