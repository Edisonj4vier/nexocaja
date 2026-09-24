/**
 * Utilidades de validación de documentos de identidad ecuatorianos para el Backend
 */

export const PROVINCES_ECUADOR: Record<string, string> = {
  '01': 'Azuay',
  '02': 'Bolívar',
  '03': 'Cañar',
  '04': 'Carchi',
  '05': 'Cotopaxi',
  '06': 'Chimborazo',
  '07': 'El Oro',
  '08': 'Esmeraldas',
  '09': 'Guayas',
  '10': 'Imbabura',
  '11': 'Loja',
  '12': 'Los Ríos',
  '13': 'Manabí',
  '14': 'Morona Santiago',
  '15': 'Napo',
  '16': 'Pastaza',
  '17': 'Pichincha',
  '18': 'Tungurahua',
  '19': 'Zamora Chinchipe',
  '20': 'Galápagos',
  '21': 'Sucumbíos',
  '22': 'Orellana',
  '23': 'Santo Domingo de los Tsáchilas',
  '24': 'Santa Elena',
  '30': 'Exterior',
};

export interface IdentificationValidationResult {
  isValid: boolean;
  error?: string;
  province?: string;
}

/**
 * Valida una cédula ecuatoriana de 10 dígitos mediante el algoritmo Módulo 10
 */
export function validateEcuadorianCedula(cedula: string): IdentificationValidationResult {
  if (!cedula || typeof cedula !== 'string') {
    return { isValid: false, error: 'La cédula es requerida' };
  }

  const clean = cedula.trim();

  // Debe contener solo números
  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'La cédula debe contener exclusivamente números' };
  }

  // Exactamente 10 dígitos
  if (clean.length !== 10) {
    return { isValid: false, error: `La cédula debe tener exactamente 10 dígitos (actualmente ${clean.length})` };
  }

  // Código de provincia
  const provCode = clean.substring(0, 2);
  const province = PROVINCES_ECUADOR[provCode];
  if (!province) {
    return { isValid: false, error: `Código de provincia no válido (${provCode})` };
  }

  // Tercer dígito menor a 6 para personas naturales
  const thirdDigit = parseInt(clean.charAt(2), 10);
  if (thirdDigit < 0 || thirdDigit > 5) {
    return { isValid: false, error: 'Tercer dígito inválido para persona natural (debe ser de 0 a 5)' };
  }

  // Módulo 10
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let product = parseInt(clean.charAt(i), 10) * coefficients[i];
    if (product >= 10) {
      product -= 9;
    }
    sum += product;
  }

  const verifierDigit = (10 - (sum % 10)) % 10;
  const lastDigit = parseInt(clean.charAt(9), 10);

  if (verifierDigit !== lastDigit) {
    return { isValid: false, error: 'Dígito verificador incorrecto. Cédula no válida' };
  }

  return { isValid: true, province };
}

/**
 * Valida un RUC ecuatoriano de 13 dígitos
 */
export function validateEcuadorianRuc(ruc: string): IdentificationValidationResult {
  if (!ruc || typeof ruc !== 'string') {
    return { isValid: false, error: 'El RUC es requerido' };
  }

  const clean = ruc.trim();

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'El RUC debe contener exclusivamente números' };
  }

  if (clean.length !== 13) {
    return { isValid: false, error: `El RUC debe tener exactamente 13 dígitos (actualmente ${clean.length})` };
  }

  const provCode = clean.substring(0, 2);
  const province = PROVINCES_ECUADOR[provCode];
  if (!province) {
    return { isValid: false, error: 'Código de provincia no válido en el RUC' };
  }

  const thirdDigit = parseInt(clean.charAt(2), 10);

  // Persona Natural
  if (thirdDigit >= 0 && thirdDigit <= 5) {
    const cedulaPart = clean.substring(0, 10);
    const cedulaRes = validateEcuadorianCedula(cedulaPart);
    if (!cedulaRes.isValid) {
      return { isValid: false, error: `RUC inválido: ${cedulaRes.error}` };
    }
    const establishment = clean.substring(10, 13);
    if (establishment === '000') {
      return { isValid: false, error: 'El establecimiento del RUC no puede ser 000' };
    }
    return { isValid: true, province };
  }

  // Persona Jurídica Privada (3er dígito = 9)
  if (thirdDigit === 9) {
    const coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(clean.charAt(i), 10) * coefficients[i];
    }
    const remainder = sum % 11;
    const verifier = remainder === 0 ? 0 : 11 - remainder;
    if (verifier !== parseInt(clean.charAt(9), 10)) {
      return { isValid: false, error: 'Dígito verificador de RUC jurídico incorrecto' };
    }
    if (clean.substring(10, 13) === '000') {
      return { isValid: false, error: 'El establecimiento del RUC no puede ser 000' };
    }
    return { isValid: true, province };
  }

  // Entidad Pública (3er dígito = 6)
  if (thirdDigit === 6) {
    const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(clean.charAt(i), 10) * coefficients[i];
    }
    const remainder = sum % 11;
    const verifier = remainder === 0 ? 0 : 11 - remainder;
    if (verifier !== parseInt(clean.charAt(8), 10)) {
      return { isValid: false, error: 'Dígito verificador de RUC público incorrecto' };
    }
    if (clean.substring(9, 13) === '0000') {
      return { isValid: false, error: 'El establecimiento del RUC no puede ser 0000' };
    }
    return { isValid: true, province };
  }

  return { isValid: false, error: 'Tercer dígito de RUC inválido' };
}

/**
 * Validador unificado
 */
export function validateIdentification(type: string, number: string): IdentificationValidationResult {
  const normType = (type || '').toLowerCase();
  if (normType.includes('cédula') || normType.includes('cedula')) {
    return validateEcuadorianCedula(number);
  }
  if (normType.includes('ruc')) {
    return validateEcuadorianRuc(number);
  }
  if (normType.includes('pasaporte')) {
    const clean = (number || '').trim();
    if (clean.length < 5 || clean.length > 20 || !/^[a-zA-Z0-9]+$/.test(clean)) {
      return { isValid: false, error: 'Pasaporte debe ser alfanumérico entre 5 y 20 caracteres' };
    }
    return { isValid: true };
  }
  if (number && number.trim().length >= 5) {
    return { isValid: true };
  }
  return { isValid: false, error: 'Número de identificación no válido' };
}
