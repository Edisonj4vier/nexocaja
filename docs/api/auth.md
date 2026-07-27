# API: Autenticación (`/auth`)

## Resumen
Maneja el inicio de sesión de los usuarios del sistema.

## Endpoints

### `POST /api/auth/login`
- **Descripción**: Valida credenciales (`email`, `password`) y retorna un `accessToken` (JWT).
- **Acceso**: Público (no requiere token).
- **Respuesta Exitosa**:
  ```json
  {
    "success": true,
    "message": "Login exitoso",
    "data": { "accessToken": "eyJ..." }
  }
  ```
