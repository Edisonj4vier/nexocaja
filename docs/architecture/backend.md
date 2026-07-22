# Arquitectura Backend

**Proyecto:** NexoCaja  
**Versión:** 0.1.0  
**Framework:** NestJS 11

---

# Objetivo

Definir las reglas de desarrollo del backend para mantener un código consistente, escalable y fácil de mantener.

---

# Arquitectura

El backend está organizado por módulos funcionales.

Cada módulo encapsula toda la lógica relacionada con una característica del sistema.

```
src/

common/
config/
prisma/

modules/

    auth/

    users/

    customers/

    accounts/

    cashier/

    reports/
```

---

# Estructura de un módulo

Todos los módulos seguirán exactamente la misma estructura.

```
users/

│
├── controllers/
│
├── dto/
│
├── entities/
│
├── interfaces/
│
├── services/
│
├── mappers/
│
├── repositories/
│
├── decorators/
│
├── guards/
│
├── users.module.ts
│
└── index.ts
```

No todos los directorios se utilizarán desde el primer día, pero mantener la misma estructura en todos los módulos facilita el mantenimiento.

---

# Responsabilidades

## Controller

Responsabilidades:

- Recibir solicitudes HTTP.
- Validar parámetros mediante DTO.
- Invocar servicios.
- Retornar respuestas HTTP.

El Controller **no contiene lógica de negocio**.

---

## Service

Responsabilidades:

- Implementar reglas de negocio.
- Coordinar operaciones.
- Utilizar Prisma.
- Lanzar excepciones cuando sea necesario.

Toda la lógica del sistema reside aquí.

---

## DTO

Los DTO definen la estructura de los datos de entrada y salida.

Ejemplo:

```
CreateCustomerDto

UpdateCustomerDto

CustomerResponseDto
```

Todos los DTO utilizarán `class-validator`.

---

## Entities

Representan los objetos del dominio cuando sea necesario desacoplar la API del modelo de Prisma.

---

## Mappers

Transforman objetos entre:

- Prisma → DTO
- DTO → Prisma
- Entidad → Respuesta

Esto evita exponer directamente el modelo de la base de datos.

---

## Repositories

En el MVP se utilizará Prisma directamente desde los servicios.

La carpeta queda reservada para una futura abstracción si fuera necesaria.

---

# Prisma

Prisma será el único componente con acceso directo a PostgreSQL.

Ningún Controller realizará consultas a la base de datos.

---

# Configuración

Toda configuración provendrá de:

```
ConfigService
```

Nunca se utilizará:

```ts
process.env;
```

directamente dentro del código.

---

# Validaciones

Todas las entradas deberán validarse mediante:

- class-validator
- ValidationPipe

La validación global será obligatoria.

---

# Manejo de errores

Se utilizarán las excepciones estándar de NestJS:

- BadRequestException
- UnauthorizedException
- ForbiddenException
- NotFoundException
- ConflictException

No se lanzarán errores genéricos (`throw new Error()`).

---

# Respuestas

Las respuestas de la API seguirán un formato consistente.

Ejemplo:

```json
{
  "data": {
    "id": "...",
    "name": "Juan Pérez"
  },
  "message": "Usuario obtenido correctamente."
}
```

En caso de error:

```json
{
  "statusCode": 404,
  "message": "Usuario no encontrado.",
  "error": "Not Found"
}
```

---

# Seguridad

- Contraseñas con bcrypt.
- JWT para autenticación.
- Guards para autorización.
- Roles para control de acceso.

---

# Convenciones

## Clases

PascalCase

```
AuthService
```

---

## Variables

camelCase

```
passwordHash
```

---

## Archivos

kebab-case

```
auth.service.ts
```

---

## Base de datos

snake_case

```
created_at
```

---

# Flujo de una petición

```
Cliente

↓

Controller

↓

DTO

↓

Service

↓

Prisma

↓

PostgreSQL

↓

Service

↓

Controller

↓

Respuesta
```

---

# Principios

- Separación de responsabilidades.
- Una única responsabilidad por clase.
- Código limpio.
- Validaciones centralizadas.
- Reutilización.
- Modularidad.

---

# Dependencias

Las dependencias entre módulos deben ser mínimas.

Ejemplo:

```
Cashier

↓

Accounts

↓

Customers
```

No se permiten dependencias circulares.

---

# Testing

Cada módulo deberá incluir pruebas para:

- Servicios
- Controladores
- Casos de uso críticos

Las pruebas del MVP se implementarán al finalizar cada módulo principal.

---

# Checklist para un nuevo módulo

Antes de considerar terminado un módulo, deberá cumplir:

- [ ] Module creado.
- [ ] Controller implementado.
- [ ] Service implementado.
- [ ] DTOs creados.
- [ ] Validaciones configuradas.
- [ ] Documentación Swagger.
- [ ] Pruebas básicas.
