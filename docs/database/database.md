# Base de Datos - NexoCaja

**Proyecto:** NexoCaja  
**Versión:** 0.1.0  
**Estado:** Diseño  
**Última actualización:** 2026-07-15

---

# Objetivo

Definir el modelo de datos que soportará el sistema financiero NexoCaja.

El diseño busca cumplir los siguientes principios:

- Normalización de datos.
- Integridad referencial.
- Escalabilidad.
- Facilidad de auditoría.
- Compatibilidad con Prisma ORM.

---

# Diagrama General

```
Usuarios
      │
      │
      ▼
Roles

Clientes
      │
      ▼
Cuentas
      │
      ▼
Movimientos
      │
      ▼
Caja

Reportes

Auditoría
```

---

# Entidades del MVP

## 1. Roles

Representa los permisos del sistema.

Campos

| Campo       | Tipo      |
| ----------- | --------- |
| id          | UUID      |
| name        | String    |
| description | String    |
| created_at  | Timestamp |
| updated_at  | Timestamp |

---

## 2. Usuarios

Usuarios que pueden acceder al sistema.

Campos

| Campo         | Tipo      |
| ------------- | --------- |
| id            | UUID      |
| role_id       | UUID      |
| first_name    | String    |
| last_name     | String    |
| email         | String    |
| password_hash | String    |
| status        | Enum      |
| last_login    | Timestamp |
| created_at    | Timestamp |
| updated_at    | Timestamp |

Relaciones

Usuario

↓

Role

---

## 3. Clientes

Información de los socios o clientes de la caja.

Campos

| Campo          | Tipo      |
| -------------- | --------- |
| id             | UUID      |
| identification | String    |
| first_name     | String    |
| last_name      | String    |
| birth_date     | Date      |
| phone          | String    |
| email          | String    |
| address        | String    |
| status         | Enum      |
| created_at     | Timestamp |
| updated_at     | Timestamp |

Observaciones

- La identificación debe ser única.
- Un cliente puede tener varias cuentas.

---

## 4. Cuentas

Representa una cuenta de ahorro.

Campos

| Campo          | Tipo      |
| -------------- | --------- |
| id             | UUID      |
| customer_id    | UUID      |
| account_number | String    |
| opening_date   | Date      |
| balance        | Decimal   |
| status         | Enum      |
| created_at     | Timestamp |
| updated_at     | Timestamp |

Relación

Cliente

↓

Muchas cuentas

---

## 5. Movimientos

Registro de todas las operaciones.

Campos

| Campo            | Tipo      |
| ---------------- | --------- |
| id               | UUID      |
| account_id       | UUID      |
| cashier_user_id  | UUID      |
| movement_type    | Enum      |
| amount           | Decimal   |
| previous_balance | Decimal   |
| current_balance  | Decimal   |
| description      | String    |
| created_at       | Timestamp |

Tipos

- DEPÓSITO
- RETIRO
- AJUSTE

---

## 6. Caja

Control de efectivo.

Campos

| Campo           | Tipo      |
| --------------- | --------- |
| id              | UUID      |
| cashier_user_id | UUID      |
| opening_amount  | Decimal   |
| closing_amount  | Decimal   |
| opened_at       | Timestamp |
| closed_at       | Timestamp |
| status          | Enum      |

---

## 7. Reportes

Los reportes no tendrán tablas propias.

Serán generados a partir de consultas sobre:

- Clientes
- Cuentas
- Movimientos
- Caja

---

## 8. Auditoría

(No incluida en el MVP)

Permitirá registrar todas las acciones críticas.

Campos

| Campo      | Tipo      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| action     | String    |
| entity     | String    |
| entity_id  | UUID      |
| old_value  | JSON      |
| new_value  | JSON      |
| created_at | Timestamp |

---

# Relaciones

```
Role
 │
 └──────< User

Customer
 │
 └──────< Account

Account
 │
 └──────< Movement

User
 │
 └──────< CashSession

User
 │
 └──────< Movement
```

---

# Enumeraciones

## UserStatus

```
ACTIVE

INACTIVE

LOCKED
```

---

## AccountStatus

```
ACTIVE

INACTIVE

CLOSED
```

---

## MovementType

```
DEPOSIT

WITHDRAWAL

ADJUSTMENT
```

---

## CashSessionStatus

```
OPEN

CLOSED
```

---

# Reglas de negocio

## Cliente

- La identificación debe ser única.
- No puede eliminarse si tiene cuentas activas.

---

## Cuenta

- El saldo nunca puede ser negativo.
- El número de cuenta debe ser único.

---

## Movimiento

- Todo movimiento modifica el saldo.
- Todo movimiento debe registrar el saldo anterior y el nuevo saldo.
- Los movimientos no se eliminan.

---

## Caja

- Solo puede existir una caja abierta por cajero.
- No puede registrarse un movimiento si la caja está cerrada.

---

# Índices

Se crearán índices para:

- email
- identification
- account_number
- created_at
- movement_type

---

# Eliminación de registros

No se eliminarán registros financieros.

Se utilizará:

- status
- active
- deleted_at (si en el futuro se implementa Soft Delete)

---

# Próximas entidades

Después del MVP se incorporarán:

- Créditos
- Tabla de amortización
- Pagos
- Mora
- Intereses
- Garantías
- Fiadores
- Contabilidad General
