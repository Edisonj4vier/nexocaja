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

/**
 * Convierte una fecha ISO (YYYY-MM-DD o ISO string) al formato visual ecuatoriano DD/MM/YYYY.
 */
export function isoToDisplayDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const clean = iso.split('T')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  if (!y || !m || !d) return '';
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
}

/**
 * Convierte una fecha en formato visual DD/MM/YYYY al formato ISO YYYY-MM-DD.
 * Si es inválida o incompleta, retorna cadena vacía.
 */
export function displayToIsoDate(display: string | null | undefined): string {
  if (!display) return '';
  const clean = display.trim();
  const parts = clean.split('/');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return '';
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  const year = parseInt(y, 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Aplica una máscara para facilitar la escritura y edición de DD/MM/YYYY.
 * - Permite escritura continua de 8 dígitos ("21102026" -> "21/10/2026").
 * - Preserva segmentos al editar día, mes o año individualmente sin desplazar dígitos entre barras (evita truncar o borrar el año).
 */
export function maskDateInput(val: string): string {
  if (!val) return '';

  const parts = val.split('/');

  // Si el usuario ingresa dígitos continuos sin barras
  if (parts.length === 1) {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }

  // Si ya contiene barras (edición en campo)
  let day = parts[0].replace(/\D/g, '');
  let month = parts[1] !== undefined ? parts[1].replace(/\D/g, '') : '';
  let year = parts[2] !== undefined ? parts[2].replace(/\D/g, '') : '';

  // Si el día excede 2 dígitos
  if (day.length > 2) {
    if (!month) {
      month = day.slice(2);
    }
    day = day.slice(0, 2);
  }

  // Si el mes excede 2 dígitos
  if (month.length > 2) {
    if (!year) {
      year = month.slice(2);
    }
    month = month.slice(0, 2);
  }

  // El año como máximo 4 dígitos
  year = year.slice(0, 4);

  if (parts.length === 2 && !year) {
    return `${day}/${month}`;
  }
  return `${day}/${month}/${year}`;
}
