# Casos de Uso - NexoCaja

**Proyecto:** NexoCaja  
**Versión:** 0.1.0  
**Estado:** MVP  
**Última actualización:** 2026-07-15

---

# Introducción

Este documento describe los casos de uso funcionales del sistema.

Cada caso de uso representa una funcionalidad que aporta valor al usuario y servirá como base para:

- Desarrollo
- Pruebas
- Documentación
- Criterios de aceptación

---

# UC-001 - Iniciar sesión

## Objetivo

Permitir que un usuario autenticado acceda al sistema.

## Actores

- Administrador
- Cajero

## Precondiciones

- El usuario existe.
- El usuario está activo.
- El usuario conoce su contraseña.

## Flujo principal

1. El usuario abre la pantalla de inicio de sesión.
2. Ingresa correo electrónico.
3. Ingresa contraseña.
4. El sistema valida las credenciales.
5. El sistema genera un JWT.
6. El sistema registra la fecha del último acceso.
7. El sistema redirecciona al Dashboard.

## Flujo alternativo

### A1

Correo inexistente.

Resultado:

```
Credenciales inválidas.
```

---

### A2

Contraseña incorrecta.

Resultado

```
Credenciales inválidas.
```

---

### A3

Usuario inactivo.

Resultado

```
Usuario deshabilitado.
```

---

## Postcondiciones

- JWT generado.
- Sesión iniciada.

---

# UC-002 - Registrar Usuario

## Actor

Administrador

## Objetivo

Crear un nuevo usuario del sistema.

## Flujo principal

1. Seleccionar "Nuevo usuario".
2. Completar información.
3. Seleccionar rol.
4. Guardar.

## Validaciones

- Email único.
- Contraseña mínima de 8 caracteres.
- Nombre obligatorio.

## Resultado

Usuario registrado correctamente.

---

# UC-003 - Registrar Cliente

## Actor

Administrador
Cajero

## Objetivo

Registrar un nuevo cliente.

## Flujo principal

1. Abrir formulario.
2. Ingresar identificación.
3. Ingresar nombres.
4. Ingresar apellidos.
5. Registrar teléfono.
6. Registrar dirección.
7. Guardar.

## Reglas

- Identificación única.
- Todos los campos obligatorios excepto correo electrónico.

## Resultado

Cliente registrado.

---

# UC-004 - Abrir Cuenta

## Actor

Administrador
Cajero

## Objetivo

Crear una cuenta de ahorro.

## Flujo principal

1. Buscar cliente.
2. Seleccionar cliente.
3. Crear cuenta.
4. Generar número de cuenta.
5. Guardar.

## Validaciones

Cliente existente.

Cuenta activa.

Número de cuenta único.

## Resultado

Cuenta creada.

---

# UC-005 - Abrir Caja

## Actor

Cajero

## Objetivo

Iniciar una sesión de caja.

## Flujo

1. Registrar monto inicial.
2. Confirmar apertura.
3. Registrar fecha y hora.

## Restricciones

Solo una caja abierta por cajero.

## Resultado

Caja abierta.

---

# UC-006 - Registrar Depósito

## Actor

Cajero

## Objetivo

Registrar un depósito en una cuenta.

## Flujo principal

1. Buscar cliente.
2. Seleccionar cuenta.
3. Ingresar monto.
4. Confirmar operación.
5. Registrar movimiento.
6. Actualizar saldo.
7. Emitir comprobante.

## Validaciones

Monto mayor que cero.

Cuenta activa.

Caja abierta.

## Resultado

Depósito realizado.

---

# UC-007 - Registrar Retiro

## Actor

Cajero

## Flujo

1. Buscar cliente.
2. Seleccionar cuenta.
3. Ingresar monto.
4. Validar saldo.
5. Registrar movimiento.
6. Actualizar saldo.

## Validaciones

Saldo suficiente.

Caja abierta.

Cuenta activa.

## Resultado

Retiro exitoso.

---

# UC-008 - Consultar Movimientos

## Actor

Administrador
Cajero

## Objetivo

Consultar el historial de movimientos.

## Filtros

- Fecha inicial
- Fecha final
- Cliente
- Número de cuenta
- Tipo de movimiento

## Resultado

Listado paginado.

---

# UC-009 - Cerrar Caja

## Actor

Cajero

## Flujo

1. Consultar saldo.
2. Confirmar cierre.
3. Registrar hora.
4. Registrar monto final.

## Restricciones

No puede existir una caja abierta después del cierre.

## Resultado

Caja cerrada.

---

# UC-010 - Reporte de Aperturas

## Actor

Administrador

## Objetivo

Generar un reporte de cuentas abiertas.

## Filtros

Fecha inicial.

Fecha final.

## Formatos

- PDF
- Excel

## Resultado

Archivo descargado.

---

# Casos de uso futuros

No forman parte del MVP.

- UC-011 Solicitar crédito.
- UC-012 Aprobar crédito.
- UC-013 Registrar pago.
- UC-014 Calcular intereses.
- UC-015 Registrar mora.
- UC-016 Reestructuración.
- UC-017 Auditoría.
