# NexoCaja

> Sistema web de gestión financiera para cajas de ahorro comunitarias y microfinancieras.

![Version](https://img.shields.io/badge/version-1.0.0--MVP-blue)
![Backend](https://img.shields.io/badge/NestJS-11-red)
![Frontend](https://img.shields.io/badge/React-19-blue)
![Database](https://img.shields.io/badge/PostgreSQL-17-blue)
![ORM](https://img.shields.io/badge/Prisma-6.16-green)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v4-cyan)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📌 Descripción

**NexoCaja** es una plataforma integral diseñada para digitalizar y automatizar las operaciones diarias de cajas comunitarias, cooperativas y fondos de ahorro comunales:
- Administración de socios y clientes.
- Apertura y gestión de cuentas de ahorro.
- Operaciones de caja diaria (apertura, arqueo, cierre con balances automáticos).
- Registro atómico de movimientos (depósitos y retiros).
- Dashboard con métricas e indicadores financieros en vivo.
- Centro de reportes con previsualización y exportación a **Excel (.xlsx)** y **PDF (.pdf)** con branding institucional.
- Seguridad basada en roles (**ADMIN** y **CASHIER**) con autenticación JWT y Guards.

---

## 🚀 Arquitectura

```
  ┌────────────────────────────────────────────────────────┐
  │                 Frontend (React 19 + Vite)              │
  │   Tailwind CSS v4 + shadcn/ui + TanStack Table + Zod    │
  └──────────────────────────┬─────────────────────────────┘
                             │ REST API / JWT
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 Backend (NestJS 11)                    │
  │     Controllers, Services, DTOs, Guards, ExcelJS, PDFKit│
  └──────────────────────────┬─────────────────────────────┘
                             │ Prisma Client
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │                 PostgreSQL 17 Database                 │
  └────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Backend
* **NestJS 11** (Arquitectura modular, Dependency Injection)
* **Prisma ORM 6.16** (Modelado y transacciones atómicas con `$transaction`)
* **PostgreSQL 17**
* **Passport + JWT** (Autenticación y Guards RBAC)
* **Swagger / OpenAPI** (Documentación interactiva de API)
* **ExcelJS & PDFKit** (Generación de hojas de cálculo y documentos PDF)
* **Class Validator & Transformer**

### Frontend
* **React 19** con **Vite**
* **TypeScript**
* **Tailwind CSS v4**
* **shadcn/ui** & **Radix UI**
* **TanStack Table v8** (Tablas interactivas con sorting y filtros)
* **TanStack Query** & **Axios** (Interceptores JWT automáticos)
* **Zustand** (Manejo de estado de autenticación y sesión)
* **React Hook Form** + **Zod** (Validación de formularios)
* **Lucide Icons**

---

## 💻 Despliegue con Docker Compose (Producción)

Para levantar todos los servicios (Base de Datos + Backend + Frontend Web) en un solo comando:

```bash
docker compose up --build -d
```

### Servicios disponibles:
* **Frontend Web**: [http://localhost:5173](http://localhost:5173) (o `:80`)
* **API Backend**: [http://localhost:3000](http://localhost:3000)
* **Swagger API Docs**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
* **PostgreSQL**: `localhost:5435`

---

## 🔧 Ejecución Local en Desarrollo

### 1. Base de Datos
```bash
docker compose up postgres -d
```

### 2. Backend
```bash
cd backend
pnpm install
# Configurar .env con DATABASE_URL
pnpm prisma migrate dev
pnpm prisma db seed
pnpm start:dev
```

### 3. Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

---

## 🔑 Credenciales por Defecto (Seed)

* **Usuario Administrador**:
  - Email: `admin@nexocaja.com`
  - Contraseña: `Admin123!`
  - Rol: `ADMIN`

---

## 📊 Módulos y Rutas del Sistema

| Módulo | Ruta Frontend | Endpoint Backend | Rol |
|---|---|---|---|
| **Dashboard** | `/` | `GET /api/dashboard/summary` | ADMIN, CASHIER |
| **Usuarios** | `/users` | `CRUD /api/users` | ADMIN |
| **Clientes** | `/clients` | `CRUD /api/clients` | ADMIN, CASHIER |
| **Cuentas** | `/accounts` | `CRUD /api/accounts` | ADMIN, CASHIER |
| **Caja Registradora** | `/cash-register` | `/api/cash-registers/open, close, current` | ADMIN, CASHIER |
| **Movimientos** | `/movements` | `/api/movements/deposit, withdrawal, list` | ADMIN, CASHIER |
| **Centro de Reportes** | `/reports` | `GET /api/reports/clients, accounts, movements, cash-registers` | ADMIN, CASHIER |

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
