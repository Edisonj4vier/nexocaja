/**
 * Utilidades de validación y generación para documentos de identidad en Ecuador
 * Basado en la normativa del Registro Civil del Ecuador y SRI.
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
  documentType?: 'Cédula' | 'RUC' | 'Pasaporte';
}

/**
 * Valida una cédula ecuatoriana de 10 dígitos mediante el algoritmo Módulo 10
 */
export function validateEcuadorianCedula(cedula: string): IdentificationValidationResult {
  if (!cedula || typeof cedula !== 'string') {
    return { isValid: false, error: 'La cédula es requerida', documentType: 'Cédula' };
  }

  const clean = cedula.trim();

  // Debe tener solo números
  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'La cédula solo debe contener dígitos numéricos', documentType: 'Cédula' };
  }

  // Debe tener exactamente 10 dígitos
  if (clean.length !== 10) {
    return {
      isValid: false,
      error: `La cédula debe tener exactamente 10 dígitos (actualmente ${clean.length})`,
      documentType: 'Cédula',
    };
  }

  // Validar código de provincia (dos primeros dígitos: 01 a 24 o 30)
  const provCode = clean.substring(0, 2);
  const province = PROVINCES_ECUADOR[provCode];
  if (!province) {
    return {
      isValid: false,
      error: `Código de provincia no válido (${provCode}). Debe ser entre 01 y 24, o 30`,
      documentType: 'Cédula',
    };
  }

  // Tercer dígito debe ser menor a 6 para personas naturales
  const thirdDigit = parseInt(clean.charAt(2), 10);
  if (thirdDigit < 0 || thirdDigit > 5) {
    return {
      isValid: false,
      error: 'Tercer dígito inválido para persona natural (debe ser entre 0 y 5)',
      province,
      documentType: 'Cédula',
    };
  }

  // Algoritmo Módulo 10 con coeficientes 2, 1, 2, 1, 2, 1, 2, 1, 2
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
    return {
      isValid: false,
      error: 'Dígito verificador incorrecto. La cédula ingresada no existe',
      province,
      documentType: 'Cédula',
    };
  }

  return {
    isValid: true,
    province,
    documentType: 'Cédula',
  };
}

/**
 * Valida un RUC ecuatoriano de 13 dígitos
 */
export function validateEcuadorianRuc(ruc: string): IdentificationValidationResult {
  if (!ruc || typeof ruc !== 'string') {
    return { isValid: false, error: 'El RUC es requerido', documentType: 'RUC' };
  }

  const clean = ruc.trim();

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'El RUC solo debe contener dígitos numéricos', documentType: 'RUC' };
  }

  if (clean.length !== 13) {
    return {
      isValid: false,
      error: `El RUC debe tener exactamente 13 dígitos (actualmente ${clean.length})`,
      documentType: 'RUC',
    };
  }

  const provCode = clean.substring(0, 2);
  const province = PROVINCES_ECUADOR[provCode];
  if (!province) {
    return { isValid: false, error: 'Código de provincia no válido en el RUC', documentType: 'RUC' };
  }

  const thirdDigit = parseInt(clean.charAt(2), 10);

  // 1. RUC de Persona Natural (tercer dígito entre 0 y 5)
  if (thirdDigit >= 0 && thirdDigit <= 5) {
    const cedulaPart = clean.substring(0, 10);
    const cedulaValidation = validateEcuadorianCedula(cedulaPart);
    if (!cedulaValidation.isValid) {
      return { isValid: false, error: `Base de cédula inválida: ${cedulaValidation.error}`, documentType: 'RUC' };
    }
    const establishment = clean.substring(10, 13);
    if (establishment === '000') {
      return { isValid: false, error: 'El código de establecimiento no puede ser 000', documentType: 'RUC' };
    }
    return { isValid: true, province, documentType: 'RUC' };
  }

  // 2. RUC de Persona Jurídica Privada o Extranjeros sin cédula (tercer dígito = 9)
  if (thirdDigit === 9) {
    const coefficients = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(clean.charAt(i), 10) * coefficients[i];
    }
    const remainder = sum % 11;
    const verifier = remainder === 0 ? 0 : 11 - remainder;
    if (verifier !== parseInt(clean.charAt(9), 10)) {
      return { isValid: false, error: 'Dígito verificador de RUC jurídico incorrecto', province, documentType: 'RUC' };
    }
    const establishment = clean.substring(10, 13);
    if (establishment === '000') {
      return { isValid: false, error: 'El establecimiento del RUC no puede ser 000', documentType: 'RUC' };
    }
    return { isValid: true, province, documentType: 'RUC' };
  }

  // 3. RUC de Institución Pública (tercer dígito = 6)
  if (thirdDigit === 6) {
    const coefficients = [3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(clean.charAt(i), 10) * coefficients[i];
    }
    const remainder = sum % 11;
    const verifier = remainder === 0 ? 0 : 11 - remainder;
    if (verifier !== parseInt(clean.charAt(8), 10)) {
      return { isValid: false, error: 'Dígito verificador de RUC público incorrecto', province, documentType: 'RUC' };
    }
    const establishment = clean.substring(9, 13);
    if (establishment === '0000') {
      return { isValid: false, error: 'El establecimiento del RUC público no puede ser 0000', documentType: 'RUC' };
    }
    return { isValid: true, province, documentType: 'RUC' };
  }

  return { isValid: false, error: 'Tercer dígito de RUC inválido', province, documentType: 'RUC' };
}

/**
 * Valida un Pasaporte
 */
export function validatePassport(passport: string): IdentificationValidationResult {
  if (!passport || typeof passport !== 'string') {
    return { isValid: false, error: 'El pasaporte es requerido', documentType: 'Pasaporte' };
  }
  const clean = passport.trim();
  if (clean.length < 5 || clean.length > 20) {
    return { isValid: false, error: 'El pasaporte debe tener entre 5 y 20 caracteres', documentType: 'Pasaporte' };
  }
  if (!/^[a-zA-Z0-9]+$/.test(clean)) {
    return { isValid: false, error: 'El pasaporte solo puede contener letras y números', documentType: 'Pasaporte' };
  }
  return { isValid: true, documentType: 'Pasaporte' };
}

/**
 * Validador unificado según el tipo de documento seleccionado
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
    return validatePassport(number);
  }
  // Default: si tiene al menos 5 caracteres
  if (number && number.trim().length >= 5) {
    return { isValid: true };
  }
  return { isValid: false, error: 'Identificación no válida' };
}

/**
 * Genera una cédula ecuatoriana matemáticamente válida para tests o datos de prueba.
 * @param provinceCode Código de provincia de 2 dígitos (ej. '17' para Pichincha)
 */
export function generateValidCedula(provinceCode = '17'): string {
  // Asegurar provincia válida
  const prov = PROVINCES_ECUADOR[provinceCode] ? provinceCode : '17';
  // 3er dígito entre 0 y 5
  const thirdDigit = Math.floor(Math.random() * 6).toString();
  // 6 dígitos aleatorios
  let base = `${prov}${thirdDigit}`;
  for (let i = 0; i < 6; i++) {
    base += Math.floor(Math.random() * 10).toString();
  }

  // Calcular dígito verificador Módulo 10
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let product = parseInt(base.charAt(i), 10) * coefficients[i];
    if (product >= 10) {
      product -= 9;
    }
    sum += product;
  }
  const verifier = (10 - (sum % 10)) % 10;
  return `${base}${verifier}`;
}
