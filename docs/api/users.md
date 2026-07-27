# API: Usuarios (`/users`)

## Resumen
Gestión del personal que operará el sistema (Administradores y Cajeros).

## Endpoints

- **`POST /api/users`**: Crea un nuevo usuario. (Rol: `ADMIN`)
- **`GET /api/users`**: Lista todos los usuarios. Soporta paginación. (Rol: `ADMIN`)
- **`GET /api/users/:id`**: Obtiene los detalles de un usuario. (Rol: `ADMIN`)
- **`PATCH /api/users/:id`**: Actualiza datos de un usuario. (Rol: `ADMIN`)
- **`DELETE /api/users/:id`**: Elimina un usuario. (Rol: `ADMIN`)
