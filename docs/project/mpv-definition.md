# NexoCaja - Definición del MVP

**Proyecto:** NexoCaja  
**Versión:** 0.1.0 (MVP)  
**Estado:** En desarrollo

---

# Objetivo

Desarrollar un sistema web para una **Caja Comunitaria** que permita administrar clientes, cuentas de ahorro, operaciones de caja y reportes básicos.

El MVP busca reemplazar los registros manuales y proporcionar una plataforma segura para gestionar las operaciones diarias de la institución.

---

# Alcance del MVP

El MVP incluye únicamente las funcionalidades necesarias para que una caja comunitaria pueda operar diariamente.

---

# Módulos

## 1. Autenticación

### Funcionalidades

- Inicio de sesión.
- Autenticación mediante JWT.
- Roles de usuario.
- Consulta del usuario autenticado.

### Estado

En desarrollo.

---

## 2. Gestión de Usuarios

Permite administrar los usuarios del sistema.

### Funcionalidades

- Registrar usuario.
- Editar usuario.
- Desactivar usuario.
- Listar usuarios.
- Buscar usuarios.
- Filtrar por estado.
- Filtrar por rol.

### Roles

- Administrador

---

## 3. Gestión de Clientes

Permite registrar a los clientes de la caja.

### Funcionalidades

- Registrar cliente.
- Editar cliente.
- Consultar cliente.
- Listar clientes.
- Filtrar por:
  - Nombre
  - Identificación
  - Estado

---

## 4. Gestión de Cuentas

Permite administrar las cuentas de ahorro.

### Funcionalidades

- Apertura de cuenta.
- Consulta de cuenta.
- Estado de cuenta.
- Activar cuenta.
- Desactivar cuenta.
- Búsqueda por número de cuenta.
- Consulta de saldo.

---

## 5. Caja

Módulo utilizado por el cajero.

### Funcionalidades

- Apertura de caja.
- Cierre de caja.
- Registrar depósito.
- Registrar retiro.
- Consulta de movimientos.
- Historial por fechas.

---

## 6. Movimientos

Registro histórico de todas las operaciones.

### Tipos

- Depósito.
- Retiro.

### Información registrada

- Fecha
- Hora
- Usuario
- Cliente
- Cuenta
- Monto
- Tipo
- Observaciones

---

## 7. Reportes

Generación de reportes básicos.

### Reportes incluidos

- Clientes registrados.
- Cuentas abiertas.
- Aperturas por rango de fechas.
- Movimientos por fechas.
- Estado de cuentas.

### Exportación

- Excel
- PDF

---

## 8. Dashboard

Pantalla inicial del sistema.

### Indicadores

- Total de clientes.
- Total de cuentas.
- Total de usuarios.
- Depósitos del día.
- Retiros del día.
- Saldo en caja.
- Movimientos del día.

---

# Funcionalidades NO incluidas

Estas funcionalidades forman parte de una segunda fase del proyecto.

## Créditos

- Solicitud de crédito.
- Aprobación.
- Tabla de amortización.
- Intereses.
- Mora.
- Refinanciamiento.

---

## Contabilidad completa

- Libro Diario.
- Libro Mayor.
- Balance General.
- Estado de Resultados.
- Catálogo de cuentas.
- Asientos automáticos.
- Cierre contable.

---

## Auditoría

- Historial de cambios.
- Registro de accesos.
- Trazabilidad completa.

---

## Notificaciones

- Correo electrónico.
- SMS.
- WhatsApp.

---

## Firma electrónica

No incluida.

---

# Roles del sistema

## Administrador

Puede:

- Administrar usuarios.
- Administrar clientes.
- Administrar cuentas.
- Consultar reportes.
- Configurar el sistema.

---

## Cajero

Puede:

- Buscar clientes.
- Abrir cuentas.
- Registrar depósitos.
- Registrar retiros.
- Consultar movimientos.
- Abrir caja.
- Cerrar caja.

---

# Criterios de aceptación

El MVP se considerará terminado cuando:

- El sistema permita iniciar sesión.
- Sea posible registrar usuarios.
- Sea posible registrar clientes.
- Sea posible abrir cuentas.
- Sea posible realizar depósitos.
- Sea posible realizar retiros.
- Todos los movimientos queden registrados.
- Existan filtros de búsqueda.
- Se puedan exportar reportes a Excel y PDF.
- El sistema funcione correctamente sobre PostgreSQL.
- La API esté documentada con Swagger.

---

# Tecnologías

## Backend

- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- Passport
- Swagger

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Table
- React Hook Form
- Zod

---

# Arquitectura

- Arquitectura modular.
- API REST.
- Autenticación JWT.
- Validación global.
- Respuestas unificadas.
- PostgreSQL como base de datos principal.

---

# Entregables

Al finalizar el MVP el cliente recibirá:

- Código fuente del Backend.
- Código fuente del Frontend.
- Base de datos PostgreSQL.
- Documentación técnica.
- Documentación de instalación.
- Documentación de la API (Swagger).
- Manual básico de usuario.
- Scripts de inicialización.
- Docker Compose para despliegue.

---

# Objetivo del MVP

El MVP debe permitir que una pequeña caja comunitaria pueda registrar clientes, administrar cuentas, realizar operaciones de caja y consultar reportes básicos desde una aplicación web segura y fácil de usar.

Las funcionalidades relacionadas con créditos, contabilidad avanzada y auditoría se implementarán en fases posteriores.