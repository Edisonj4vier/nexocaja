# ADR-001 - Convenciones de nombres

## Estado

Aceptado

## Decisión

Se utilizará:

- snake_case para PostgreSQL.
- camelCase para TypeScript.
- PascalCase para clases.
- kebab-case para archivos.

Prisma será el encargado de mapear ambos mundos mediante `@map()`.

## Motivo

Mantener consistencia entre el código y la base de datos, siguiendo las convenciones estándar de cada tecnología.
