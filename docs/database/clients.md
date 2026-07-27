# Entidad: Client (Clientes)

Personas naturales que se registran en el banco y que son dueñas de las cuentas de ahorro.

## Campos Principales
- `id`: UUID único.
- `firstName`, `lastName`: Nombres completos.
- `identificationType`: Enum (`CEDULA`, `PASSPORT`, `RUC`).
- `identificationNumber`: Número de documento (único).
- `email`: Correo del cliente (único).
- `phoneNumber`: Teléfono de contacto.
- `status`: Enum (`ACTIVE`, `INACTIVE`).

## Relaciones
- Tiene muchas `Account` (Cuentas de ahorro a su nombre).
