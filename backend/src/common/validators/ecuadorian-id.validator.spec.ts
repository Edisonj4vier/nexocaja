import {
  validateEcuadorianCedula,
  validateEcuadorianRuc,
  validateIdentification,
} from './ecuadorian-id.validator';

describe('Ecuadorian ID Validator (Backend)', () => {
  describe('validateEcuadorianCedula', () => {
    it('debe aceptar cédulas válidas reales (ej. 1752466951)', () => {
      const res = validateEcuadorianCedula('1752466951');
      expect(res.isValid).toBe(true);
      expect(res.province).toBe('Pichincha');
    });

    it('debe rechazar cédulas que contengan letras', () => {
      const res = validateEcuadorianCedula('1752466951fsdfs');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/exclusivamente números/i);
    });

    it('debe rechazar cédulas con longitud distinta a 10', () => {
      expect(validateEcuadorianCedula('175246').isValid).toBe(false);
      expect(validateEcuadorianCedula('1752466951001').isValid).toBe(false);
    });

    it('debe rechazar códigos de provincia inválidos', () => {
      expect(validateEcuadorianCedula('9952466951').isValid).toBe(false);
    });

    it('debe rechazar tercer dígito mayor a 5 en personas naturales', () => {
      expect(validateEcuadorianCedula('1782466951').isValid).toBe(false);
    });

    it('debe rechazar si el dígito verificador no coincide', () => {
      expect(validateEcuadorianCedula('1752466952').isValid).toBe(false);
    });
  });

  describe('validateEcuadorianRuc', () => {
    it('debe aceptar RUC natural con base válida y sucursal 001', () => {
      const res = validateEcuadorianRuc('1752466951001');
      expect(res.isValid).toBe(true);
      expect(res.province).toBe('Pichincha');
    });

    it('debe rechazar RUC con sucursal 000', () => {
      const res = validateEcuadorianRuc('1752466951000');
      expect(res.isValid).toBe(false);
    });
  });

  describe('validateIdentification', () => {
    it('enruta según tipo de documento', () => {
      expect(validateIdentification('Cédula', '1752466951').isValid).toBe(true);
      expect(validateIdentification('Cédula', '1752466959').isValid).toBe(false);
      expect(validateIdentification('RUC', '1752466951001').isValid).toBe(true);
      expect(validateIdentification('Pasaporte', 'A1234567').isValid).toBe(true);
    });
  });
});
