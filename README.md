# NexoCaja

> Sistema de gestión financiera para cajas comunitarias.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Backend](https://img.shields.io/badge/NestJS-11-red)
![Frontend](https://img.shields.io/badge/React-19-blue)
![Database](https://img.shields.io/badge/PostgreSQL-17-blue)
![ORM](https://img.shields.io/badge/Prisma-6.16-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

# Descripción

NexoCaja es un sistema web diseñado para administrar cajas comunitarias y cooperativas pequeñas.

El proyecto busca digitalizar las operaciones diarias de una caja de ahorro y crédito, permitiendo administrar clientes, cuentas, movimientos, caja, reportes y procesos contables desde una única plataforma.

Actualmente el proyecto se desarrolla como un MVP (Minimum Viable Product) con una arquitectura escalable para futuras funcionalidades.

---

# Funcionalidades del MVP

- Autenticación de usuarios
- Gestión de usuarios
- Registro de clientes
- Apertura de cuentas
- Movimientos de caja
- Depósitos
- Retiros
- Reportes PDF
- Reportes Excel
- Historial de movimientos
- Estado de cuenta

---

# Arquitectura

```
Frontend (React + Vite)
          │
          ▼
 REST API (NestJS)
          │
          ▼
 Prisma ORM
          │
          ▼
 PostgreSQL
```

---

# Tecnologías

## Backend

- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- Passport
- Swagger
- Docker

## Frontend

- React
- Vite
- TypeScript
- React Router
- Axios
- React Hook Form

## Base de datos

- PostgreSQL 17

## DevOps

- Docker
- Docker Compose
- pnpm

---

# Requisitos

- Node.js 24+
- pnpm
- Docker
- Docker Compose

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>

cd nexocaja
```

---

## 2. Levantar PostgreSQL

```bash
docker compose up -d
```

Verificar:

```bash
docker ps
```

---

## 3. Backend

```bash
cd backend

pnpm install
```

Crear el archivo `.env` a partir de `.env.example`.

Ejecutar migraciones:

```bash
pnpm prisma migrate dev
```

Ejecutar seed:

```bash
pnpm prisma db seed
```

Levantar el servidor:

```bash
pnpm start:dev
```

---

## 4. Frontend

```bash
cd frontend

pnpm install

pnpm dev
```

---

# URLs

Backend

```
http://localhost:3000
```

Swagger

```
http://localhost:3000/api/docs
```

Frontend

```
http://localhost:5173
```

---

# Scripts útiles

## Backend

```bash
pnpm start:dev
```

```bash
pnpm prisma migrate dev
```

```bash
pnpm prisma migrate reset
```

```bash
pnpm prisma db seed
```

```bash
pnpm prisma studio
```

---

# Documentación

La documentación del proyecto se encuentra en la carpeta:

```
docs/
```

Incluye:

- Arquitectura
- Instalación
- Convenciones
- Sprint Backlog
- ADR (Architecture Decision Records)
- API

---

# Roadmap

## Sprint 1

- [x] Docker
- [x] PostgreSQL
- [x] NestJS
- [x] Prisma
- [x] Migraciones

## Sprint 2

- [ ] Login
- [ ] JWT
- [ ] Swagger

## Sprint 3

- [ ] Gestión de usuarios

## Sprint 4

- [ ] Clientes

## Sprint 5

- [ ] Apertura de cuentas

## Sprint 6

- [ ] Caja

## Sprint 7

- [ ] Reportes

---

# Licencia

MIT
