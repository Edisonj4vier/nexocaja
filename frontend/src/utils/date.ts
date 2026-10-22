/**
 * Utilidades de fecha y hora estandarizadas para el frontend de NexoCaja
 * Zona Horaria Oficial: Ecuador Continental (America/Guayaquil, UTC-5)
 */

/**
 * Retorna la fecha en formato YYYY-MM-DD garantizando la zona horaria de Ecuador (America/Guayaquil).
 * Evita el desplazamiento a mañana que ocurre con toISOString() después de las 19:00 (UTC-5).
 */
export function formatEcuadorDateYMD(d: Date | string | number = new Date()): string {
  const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil' }).format(dateObj);
}

/**
 * Formatea una fecha para visualización (ej. 21/10/2026)
 */
export function formatEcuadorDate(d: Date | string | number): string {
  const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  return dateObj.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil' });
}

/**
 * Formatea fecha y hora para comprobantes y tablas (ej. 21/10/2026, 21:45)
 */
export function formatEcuadorDateTime(d: Date | string | number): string {
  const dateObj = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  return dateObj.toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil',
  });
}
