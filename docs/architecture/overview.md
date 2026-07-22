# Arquitectura de NexoCaja

**Proyecto:** NexoCaja  
**Versión:** 0.1.0  
**Estado:** En desarrollo (MVP)  
**Última actualización:** 2026-07-15

---

# 1. Objetivo

NexoCaja es un sistema de gestión financiera para cajas comunitarias y cooperativas de ahorro y crédito de pequeña escala.

El objetivo es proporcionar una plataforma moderna para administrar clientes, cuentas, movimientos financieros, caja, reportes y procesos administrativos.

El sistema está diseñado con una arquitectura modular que permita incorporar nuevas funcionalidades sin afectar los módulos existentes.

---

# 2. Arquitectura General

```
                    Navegador Web
                          │
                          ▼
                React + TypeScript
                          │
                     HTTP / HTTPS
                          │
                          ▼
                NestJS REST API
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
      Auth Module     Users Module    Customers Module
          │
          ▼
      Prisma ORM
          │
          ▼
     PostgreSQL
```

---

# 3. Arquitectura por capas

El proyecto sigue una arquitectura en capas para separar responsabilidades.

```
┌─────────────────────────────┐
│         Frontend            │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│        Controllers          │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│         Services            │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│        Prisma ORM           │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│        PostgreSQL           │
└─────────────────────────────┘
```

Cada capa tiene una responsabilidad específica.

---

# 4. Estructura del Backend

```
backend/

src/

├── common/
│
├── config/
│
├── prisma/
│
└── modules/
    │
    ├── auth/
    ├── users/
    ├── customers/
    ├── accounts/
    ├── cashier/
    ├── accounting/
    ├── reports/
    └── health/
```

---

# 5. Responsabilidad de los módulos

## Auth

Responsable de:

- Inicio de sesión
- JWT
- Refresh Token
- Autorización

---

## Users

Responsable de:

- Crear usuarios
- Editar usuarios
- Cambiar contraseña
- Activar / desactivar usuarios

---

## Customers

Responsable de:

- Registro de clientes
- Actualización de información
- Consulta de clientes

---

## Accounts

Responsable de:

- Apertura de cuentas
- Estado de cuenta
- Consulta de saldos

---

## Cashier

Responsable de:

- Depósitos
- Retiros
- Apertura y cierre de caja
- Registro de movimientos

---

## Accounting

Responsable de:

- Catálogo de cuentas
- Asientos contables
- Balance general
- Estado de resultados

> **Nota:** Este módulo no será parte del MVP inicial, pero la arquitectura se prepara desde ahora para incorporarlo sin cambios importantes.

---

## Reports

Responsable de:

- Reportes PDF
- Reportes Excel
- Reportes por rango de fechas
- Reportes de caja

---

# 6. Flujo de una operación

Ejemplo: Depósito.

```
Usuario

↓

Frontend

↓

POST /cashier/deposit

↓

CashierController

↓

CashierService

↓

Prisma

↓

PostgreSQL

↓

Respuesta
```

---

# 7. Base de datos

Actualmente el sistema utiliza PostgreSQL.

Prisma ORM es el encargado de mapear las entidades de TypeScript con las tablas de la base de datos.

Convenciones:

- Base de datos: snake_case
- TypeScript: camelCase

---

# 8. Seguridad

La autenticación utiliza JWT.

Las contraseñas se almacenan utilizando bcrypt.

Ninguna contraseña se almacena en texto plano.

---

# 9. Convenciones

- DTO para entrada y salida de datos.
- Services contienen la lógica de negocio.
- Controllers únicamente reciben solicitudes HTTP.
- Prisma es la única capa con acceso directo a la base de datos.

---

# 10. Escalabilidad

La arquitectura está diseñada para permitir futuras integraciones como:

- Aplicación móvil.
- Integración con servicios de pago.
- Notificaciones por correo electrónico.
- Notificaciones por WhatsApp.
- Auditoría completa de operaciones.
- Multi-sucursal.
- Multi-caja.

---

# 11. Principios de desarrollo

Durante el desarrollo se seguirán los siguientes principios:

- Responsabilidad única (SRP).
- Separación de responsabilidades.
- Código limpio.
- Convenciones consistentes.
- Documentación continua.
- Migraciones controladas mediante Prisma.
- Versionado Semántico.

---

# 12. Próximos módulos

Después del módulo de autenticación se desarrollarán en el siguiente orden:

1. Usuarios.
2. Clientes.
3. Cuentas.
4. Caja.
5. Reportes.
6. Contabilidad.

Este orden prioriza entregar valor al cliente desde las primeras iteraciones.
