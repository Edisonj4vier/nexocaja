import { describe, it, expect } from 'vitest';
import {
  validateEcuadorianCedula,
  validateEcuadorianRuc,
  validatePassport,
  validateIdentification,
  generateValidCedula,
} from '../ecuadorianIdValidator';

describe('ecuadorianIdValidator', () => {
  describe('validateEcuadorianCedula', () => {
    it('valida exitosamente cédulas ecuatorianas reales', () => {
      // 1752466951 (del ejemplo del usuario)
      const res1 = validateEcuadorianCedula('1752466951');
      expect(res1.isValid).toBe(true);
      expect(res1.province).toBe('Pichincha');

      // 1712345678 -> let's check generated valid cedulas
      const validGenerated = generateValidCedula('17');
      const resGen = validateEcuadorianCedula(validGenerated);
      expect(resGen.isValid).toBe(true);
      expect(resGen.province).toBe('Pichincha');

      // Guayas (09)
      const validGuayas = generateValidCedula('09');
      const resGuayas = validateEcuadorianCedula(validGuayas);
      expect(resGuayas.isValid).toBe(true);
      expect(resGuayas.province).toBe('Guayas');
    });

    it('rechaza cédulas con letras o caracteres no numéricos', () => {
      const res = validateEcuadorianCedula('1752466951fsdfsdf');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/solo debe contener dígitos/i);
    });

    it('rechaza cédulas con longitud diferente a 10', () => {
      const resShort = validateEcuadorianCedula('1752466');
      expect(resShort.isValid).toBe(false);
      expect(resShort.error).toMatch(/exactamente 10 dígitos/i);

      const resLong = validateEcuadorianCedula('175246695101');
      expect(resLong.isValid).toBe(false);
      expect(resLong.error).toMatch(/exactamente 10 dígitos/i);
    });

    it('rechaza códigos de provincia inexistentes', () => {
      const res = validateEcuadorianCedula('9912345678');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/código de provincia no válido/i);
    });

    it('rechaza tercer dígito mayor a 5 para cédula de persona natural', () => {
      const res = validateEcuadorianCedula('1792345678');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/tercer dígito inválido/i);
    });

    it('rechaza cédulas con dígito verificador adulterado', () => {
      // 1752466951 tiene verificador 1. Si cambiamos a 2:
      const res = validateEcuadorianCedula('1752466952');
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/dígito verificador incorrecto/i);
    });
  });

  describe('validateEcuadorianRuc', () => {
    it('valida RUC de persona natural con base de cédula válida y sucursal 001', () => {
      const rucNatural = '1752466951001';
      const res = validateEcuadorianRuc(rucNatural);
      expect(res.isValid).toBe(true);
      expect(res.province).toBe('Pichincha');
    });

    it('rechaza RUC natural con sucursal 000', () => {
      const rucInvalido = '1752466951000';
      const res = validateEcuadorianRuc(rucInvalido);
      expect(res.isValid).toBe(false);
      expect(res.error).toMatch(/código de establecimiento/i);
    });
  });

  describe('validatePassport', () => {
    it('acepta pasaportes alfanuméricos válidos', () => {
      expect(validatePassport('A1234567').isValid).toBe(true);
      expect(validatePassport('PE98765432').isValid).toBe(true);
    });

    it('rechaza pasaportes demasiado cortos o con caracteres especiales', () => {
      expect(validatePassport('A12').isValid).toBe(false);
      expect(validatePassport('A12#$45').isValid).toBe(false);
    });
  });

  describe('validateIdentification unificado', () => {
    it('enruta correctamente a cédula', () => {
      expect(validateIdentification('Cédula', '1752466951').isValid).toBe(true);
      expect(validateIdentification('Cédula', '1752466952').isValid).toBe(false);
    });
  });
});
