# Entidad: User (Usuarios)

Almacena al personal que operará el sistema (Cajeros y Administradores).

## Campos Principales
- `id`: UUID único.
- `email`: Correo de acceso (único).
- `password`: Hash de la contraseña.
- `firstName`, `lastName`: Nombres completos.
- `role`: Enum (`ADMIN`, `CASHIER`). Define los permisos.
- `status`: Enum (`ACTIVE`, `INACTIVE`). Determina si puede iniciar sesión.
- `lastLogin`: Marca de tiempo de su última conexión.

## Relaciones
- Tiene muchas `CashRegister` (Turnos de caja trabajados).
- Tiene muchos `Movement` (Historial de qué empleado realizó qué transacción).
