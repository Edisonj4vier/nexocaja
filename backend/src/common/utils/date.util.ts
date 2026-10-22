/**
 * Utilidades de fecha y hora estandarizadas para el sistema financiero NexoCaja
 * Zona Horaria Oficial: Ecuador Continental (America/Guayaquil, UTC-5)
 */

/**
 * Convierte una fecha en formato YYYY-MM-DD (o ISO) al inicio del día comercial en Ecuador (00:00:00.000-05:00).
 */
export function startOfEcuadorDay(dateStr: string): Date {
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(`${dateStr}T00:00:00.000-05:00`);
}

/**
 * Convierte una fecha en formato YYYY-MM-DD (o ISO) al final del día comercial en Ecuador (23:59:59.999-05:00).
 */
export function endOfEcuadorDay(dateStr: string): Date {
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(`${dateStr}T23:59:59.999-05:00`);
}

/**
 * Formatea un objeto Date a formato YYYY-MM-DD garantizando la zona horaria de Ecuador.
 */
export function formatEcuadorDateYMD(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil' }).format(d);
}

/**
 * Formateador estándar de fecha y hora para comprobantes y reportes
 */
export function formatEcuadorDateTime(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-EC', {
    timeZone: 'America/Guayaquil',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(d);
}
