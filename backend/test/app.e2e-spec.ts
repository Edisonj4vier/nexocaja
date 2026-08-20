/**
 * NexoCaja — Tests E2E automatizados
 *
 * Cubre las secciones 1-6 del QA Test Plan:
 *   1. Autenticación (login exitoso/fallido, protección de rutas)
 *   2. Usuarios CRUD + permisos por rol
 *   3. Clientes CRUD + validaciones
 *   4. Cuentas (apertura, toggle status)
 *   5. Caja Registradora (abrir, consultar, cerrar)
 *   6. Movimientos (depósito, retiro, saldo insuficiente, filtros)
 *   7. Flujo E2E completo + matriz de permisos
 *
 * Prerrequisitos:
 *   - PostgreSQL corriendo (docker compose up -d)
 *   - Seed ejecutado (pnpm prisma db seed)
 *   - Backend NO necesita estar corriendo (los tests levantan su propia instancia)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('NexoCaja E2E Tests', () => {
  let app: INestApplication<App>;

  // Tokens
  let adminToken: string;
  let cashierToken: string;

  // IDs creados durante los tests
  let cashierUserId: string;
  let cashierRoleId: string;
  let clientId: string;
  let client2Id: string;
  let accountId: string;
  let accountNumber: string;
  let account2Id: string;
  const uniqueId = Date.now().toString();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================================
  // SECCIÓN 1: AUTENTICACIÓN
  // ============================================================
  describe('1. Autenticación', () => {
    it('1.1 — Login exitoso con admin', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@nexocaja.local', password: 'Admin123*' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe('admin@nexocaja.local');
      expect(res.body.data.user.role).toBeDefined();

      adminToken = res.body.data.accessToken;
    });

    it('1.2 — Login fallido con password incorrecta', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@nexocaja.local', password: 'WrongPassword' })
        .expect(401);
    });

    it('1.3 — Login fallido con email inexistente', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'noexiste@nexocaja.local', password: 'Admin123*' })
        .expect(401);
    });

    it('1.4 — Acceso sin token devuelve 401', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });

    it('1.5 — Acceso con token inválido devuelve 401', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', 'Bearer token-invalido-123')
        .expect(401);
    });
  });

  // ============================================================
  // SECCIÓN 2: GESTIÓN DE USUARIOS
  // ============================================================
  describe('2. Gestión de Usuarios', () => {
    it('2.1 — Obtener roles disponibles', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const roles = res.body.data;
      expect(Array.isArray(roles)).toBe(true);
      expect(roles.length).toBeGreaterThanOrEqual(3);

      const cashierRole = roles.find((r: any) => r.name === 'CASHIER');
      expect(cashierRole).toBeDefined();
      cashierRoleId = cashierRole.id;
    });

    it('2.2 — Listar usuarios (admin)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('2.3 — Crear usuario CASHIER', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'María',
          lastName: 'López',
          email: `maria.${uniqueId}@nexocaja.local`,
          password: 'Cajera123*',
          roleId: cashierRoleId,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe(`maria.${uniqueId}@nexocaja.local`);
      cashierUserId = res.body.data.id;
    });

    it('2.4 — Crear usuario con email duplicado falla', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Otro',
          lastName: 'Usuario',
          email: 'maria.test@nexocaja.local',
          password: 'Test123*',
          roleId: cashierRoleId,
        })
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });

    it('2.5 — Crear usuario con datos inválidos falla (validation)', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: '',
          email: 'no-es-un-email',
        })
        .expect(400);
    });

    it('2.6 — Editar usuario', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${cashierUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ lastName: 'López García' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.lastName).toBe('López García');
    });

    it('2.7 — Consultar usuario por ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/users/${cashierUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(cashierUserId);
      expect(res.body.data.lastName).toBe('López García');
    });

    it('2.8 — Desactivar usuario', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${cashierUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('INACTIVE');
    });

    it('2.9 — Reactivar usuario', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/users/${cashierUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('2.10 — Login con usuario CASHIER creado', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: `maria.${uniqueId}@nexocaja.local`, password: 'Cajera123*' })
        .expect(201);

      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user.role).toBe('CASHIER');
      cashierToken = res.body.data.accessToken;
    });
  });

  // ============================================================
  // SECCIÓN 3: PERMISOS POR ROL
  // ============================================================
  describe('3. Permisos por Rol', () => {
    it('3.1 — CASHIER NO puede listar usuarios', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(403);
    });

    it('3.2 — CASHIER NO puede crear usuarios', async () => {
      await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          firstName: 'Hack',
          lastName: 'Intento',
          email: 'hack@test.com',
          password: '123456',
          roleId: cashierRoleId,
        })
        .expect(403);
    });

    it('3.3 — CASHIER SÍ puede crear clientes', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          identificationType: 'CEDULA',
          identificationNumber: `CASHIER-${uniqueId}`,
          firstName: 'Test',
          lastName: 'Cashier',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('3.4 — CASHIER NO puede editar clientes', async () => {
      // Get the client created by cashier
      const listRes = await request(app.getHttpServer())
        .get('/api/clients')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      const clients = listRes.body.data?.data || listRes.body.data;
      const testClient = Array.isArray(clients)
        ? clients.find((c: any) => c.identificationNumber === `CASHIER-${uniqueId}`)
        : null;

      if (testClient) {
        await request(app.getHttpServer())
          .patch(`/api/clients/${testClient.id}`)
          .set('Authorization', `Bearer ${cashierToken}`)
          .send({ firstName: 'Editado' })
          .expect(403);
      }
    });

    it('3.5 — CASHIER NO puede cambiar status de cuentas', async () => {
      // We'll test this once we have an account
      // For now, verify the endpoint exists and requires ADMIN
      await request(app.getHttpServer())
        .patch('/api/accounts/fake-id/status')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(403);
    });
  });

  // ============================================================
  // SECCIÓN 4: GESTIÓN DE CLIENTES
  // ============================================================
  describe('4. Gestión de Clientes', () => {
    it('4.1 — Crear cliente con todos los campos', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          identificationType: 'CEDULA',
          identificationNumber: `171-${uniqueId}`,
          firstName: 'Carlos',
          lastName: 'Ramírez',
          phone: '0991234567',
          email: 'carlos@gmail.com',
          address: 'Av. Principal 123',
          birthDate: '1990-05-15',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.firstName).toBe('Carlos');
      expect(res.body.data.identificationNumber).toBe(`171-${uniqueId}`);
      expect(res.body.data.status).toBe('ACTIVE');
      clientId = res.body.data.id;
    });

    it('4.2 — Crear segundo cliente (campos mínimos)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          identificationType: 'RUC',
          identificationNumber: `RUC-${uniqueId}`,
          firstName: 'Ana',
          lastName: 'Martínez',
        })
        .expect(201);

      client2Id = res.body.data.id;
    });

    it('4.3 — Crear con identificación duplicada falla', async () => {
      await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          identificationType: 'CEDULA',
          identificationNumber: `171-${uniqueId}`,
          firstName: 'Duplicado',
          lastName: 'Test',
        })
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(400);
        });
    });

    it('4.4 — Crear con campos requeridos vacíos falla', async () => {
      await request(app.getHttpServer())
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          identificationType: '',
          identificationNumber: '',
        })
        .expect(400);
    });

    it('4.5 — Listar clientes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data;
      const clients = Array.isArray(data) ? data : data.data;
      expect(clients.length).toBeGreaterThanOrEqual(2);
    });

    it('4.6 — Consultar cliente por ID (incluye cuentas)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/clients/${clientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(clientId);
      expect(res.body.data.firstName).toBe('Carlos');
    });

    it('4.7 — Editar cliente', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/clients/${clientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ phone: '0987654321' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe('0987654321');
    });
  });

  // ============================================================
  // SECCIÓN 5: GESTIÓN DE CUENTAS
  // ============================================================
  describe('5. Gestión de Cuentas', () => {
    it('5.1 — Abrir cuenta para Carlos', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/accounts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ clientId })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accountNumber');
      expect(res.body.data.clientId).toBe(clientId);
      expect(res.body.data.status).toBe('ACTIVE');
      expect(Number(res.body.data.balance)).toBe(0);
      accountId = res.body.data.id;
      accountNumber = res.body.data.accountNumber;
    });

    it('5.2 — Abrir cuenta para Ana', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/accounts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ clientId: client2Id })
        .expect(201);

      account2Id = res.body.data.id;
    });

    it('5.3 — Listar cuentas', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/accounts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data;
      const accounts = Array.isArray(data) ? data : data.data;
      expect(accounts.length).toBeGreaterThanOrEqual(2);
    });

    it('5.4 — Consultar cuenta por ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(accountId);
      expect(res.body.data.accountNumber).toBe(accountNumber);
    });

    it('5.5 — Desactivar cuenta', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/accounts/${account2Id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.status).toBe('INACTIVE');
    });

    it('5.6 — Reactivar cuenta', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/accounts/${account2Id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.status).toBe('ACTIVE');
    });
  });

  // ============================================================
  // SECCIÓN 6: CAJA REGISTRADORA
  // ============================================================
  describe('6. Caja Registradora', () => {
    it('6.1 — Consultar caja sin tener una abierta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/cash-registers/current')
        .set('Authorization', `Bearer ${adminToken}`);

      // Puede ser 404 o un response con null
      expect([200, 404]).toContain(res.status);
    });

    it('6.2 — Abrir caja', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/cash-registers/open')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ openingBalance: 1000, observations: 'Caja de prueba E2E' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('OPEN');
      expect(Number(res.body.data.openingBalance)).toBe(1000);
      expect(res.body.data.observations).toBe('Caja de prueba E2E');
    });

    it('6.3 — Consultar caja abierta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/cash-registers/current')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('OPEN');
    });

    it('6.4 — Intentar abrir segunda caja falla', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/cash-registers/open')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ openingBalance: 500 });

      // Debería fallar con conflicto o bad request
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ============================================================
  // SECCIÓN 7: MOVIMIENTOS (DEPÓSITOS Y RETIROS)
  // ============================================================
  describe('7. Movimientos', () => {
    it('7.1 — Registrar depósito', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/movements/deposit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          accountId,
          amount: 500,
          observations: 'Depósito E2E test',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('DEPOSIT');
      expect(Number(res.body.data.amount)).toBe(500);
    });

    it('7.2 — Verificar saldo después del depósito', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Number(res.body.data.balance)).toBe(500);
    });

    it('7.3 — Registrar segundo depósito', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/movements/deposit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          accountId,
          amount: 300,
          observations: 'Segundo depósito E2E',
        })
        .expect(201);

      expect(Number(res.body.data.amount)).toBe(300);
    });

    it('7.4 — Verificar saldo acumulado', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Number(res.body.data.balance)).toBe(800);
    });

    it('7.5 — Registrar retiro exitoso', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/movements/withdrawal')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          accountId,
          amount: 200,
          observations: 'Retiro E2E test',
        })
        .expect(201);

      expect(res.body.data.type).toBe('WITHDRAWAL');
      expect(Number(res.body.data.amount)).toBe(200);
    });

    it('7.6 — Verificar saldo después del retiro', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Number(res.body.data.balance)).toBe(600);
    });

    it('7.7 — Retiro con saldo insuficiente falla', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/movements/withdrawal')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          accountId,
          amount: 99999,
          observations: 'Retiro excesivo',
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('7.8 — Saldo NO cambió tras retiro fallido', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Number(res.body.data.balance)).toBe(600);
    });

    it('7.9 — Depósito con monto inválido (0) falla', async () => {
      await request(app.getHttpServer())
        .post('/api/movements/deposit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accountId, amount: 0 })
        .expect(400);
    });

    it('7.10 — Depósito con monto negativo falla', async () => {
      await request(app.getHttpServer())
        .post('/api/movements/deposit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accountId, amount: -100 })
        .expect(400);
    });

    it('7.11 — Listar movimientos (sin filtro)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/movements')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data;
      const movements = Array.isArray(data) ? data : data.data;
      expect(movements.length).toBeGreaterThanOrEqual(3);
    });

    it('7.12 — Listar movimientos filtrados por DEPOSIT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/movements?type=DEPOSIT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const data = res.body.data;
      const movements = Array.isArray(data) ? data : data.data;
      movements.forEach((m: any) => {
        expect(m.type).toBe('DEPOSIT');
      });
    });

    it('7.13 — Listar movimientos filtrados por WITHDRAWAL', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/movements?type=WITHDRAWAL')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const data = res.body.data;
      const movements = Array.isArray(data) ? data : data.data;
      movements.forEach((m: any) => {
        expect(m.type).toBe('WITHDRAWAL');
      });
    });
  });

  // ============================================================
  // SECCIÓN 8: CERRAR CAJA Y VERIFICACIÓN FINAL
  // ============================================================
  describe('8. Cierre de Caja y Verificación Final', () => {
    it('8.1 — Cerrar caja', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/cash-registers/close')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ observations: 'Cierre E2E test' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CLOSED');
      expect(res.body.data.closingBalance).toBeDefined();
    });

    it('8.2 — Depósito sin caja abierta falla', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/movements/deposit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accountId, amount: 100 });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('8.3 — Retiro sin caja abierta falla', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/movements/withdrawal')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ accountId, amount: 100 });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('8.4 — Verificar que el cliente tiene la cuenta con saldo correcto', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/clients/${clientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.firstName).toBe('Carlos');
      // Client detail should include accounts
      if (res.body.data.accounts) {
        const account = res.body.data.accounts.find(
          (a: any) => a.id === accountId,
        );
        if (account) {
          expect(Number(account.balance)).toBe(600);
        }
      }
    });

    it('8.5 — Saldo final de la cuenta se mantiene consistente', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 500 + 300 - 200 = 600
      expect(Number(res.body.data.balance)).toBe(600);
    });
  });

  // ============================================================
  // SECCIÓN 9: DASHBOARD EN TIEMPO REAL
  // ============================================================
  describe('9. Dashboard en Tiempo Real', () => {
    it('9.1 — Consultar resumen de Dashboard como ADMIN', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const summary = res.body.data;
      expect(summary).toHaveProperty('totalClients');
      expect(summary).toHaveProperty('activeAccounts');
      expect(summary).toHaveProperty('totalUsers');
      expect(summary).toHaveProperty('todayDeposits');
      expect(summary).toHaveProperty('todayWithdrawals');
      expect(summary).toHaveProperty('recentMovements');

      expect(summary.totalClients).toBeGreaterThanOrEqual(2);
      expect(summary.activeAccounts).toBeGreaterThanOrEqual(1);
      expect(summary.todayDeposits.total).toBeGreaterThanOrEqual(800);
      expect(summary.todayWithdrawals.total).toBeGreaterThanOrEqual(200);
      expect(Array.isArray(summary.recentMovements)).toBe(true);
      expect(summary.recentMovements.length).toBeGreaterThanOrEqual(3);
    });

    it('9.2 — Consultar resumen de Dashboard como CASHIER', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalClients');
      expect(res.body.data).toHaveProperty('todayDeposits');
    });

    it('9.3 — Consultar Dashboard sin token devuelve 401', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .expect(401);
    });
  });

  // ============================================================
  // SECCIÓN 10: CENTRO DE REPORTES (JSON, EXCEL, PDF)
  // ============================================================
  describe('10. Centro de Reportes', () => {
    it('10.1 — Reporte de Clientes en JSON', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/clients?format=json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(2);
    });

    it('10.2 — Reporte de Clientes en Excel (.xlsx)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/clients?format=xlsx')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(res.headers['content-disposition']).toContain('reporte_clientes_');
      expect(res.body).toBeDefined();
    });

    it('10.3 — Reporte de Clientes en PDF (.pdf)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/clients?format=pdf')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain('reporte_clientes_');
    });

    it('10.4 — Reporte de Cuentas en JSON', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/accounts?format=json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('10.5 — Reporte de Cuentas en Excel (.xlsx)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/accounts?format=xlsx')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('10.6 — Reporte de Cuentas en PDF (.pdf)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/accounts?format=pdf')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('application/pdf');
    });

    it('10.7 — Reporte de Movimientos en JSON con bloque summary', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/movements?format=json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('summary');
      expect(res.body).toHaveProperty('data');
      expect(res.body.summary).toHaveProperty('totalMovements');
      expect(res.body.summary).toHaveProperty('totalDeposits');
      expect(res.body.summary).toHaveProperty('totalWithdrawals');
      expect(res.body.summary).toHaveProperty('netFlow');
      expect(Number(res.body.summary.totalDeposits)).toBeGreaterThanOrEqual(800);
      expect(Number(res.body.summary.totalWithdrawals)).toBeGreaterThanOrEqual(200);
    });

    it('10.8 — Reporte de Movimientos en Excel (.xlsx)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/movements?format=xlsx')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('10.9 — Reporte de Movimientos en PDF (.pdf)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/movements?format=pdf')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('application/pdf');
    });

    it('10.10 — Reporte de Cajas en JSON', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/cash-registers?format=json')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('10.11 — Reporte de Cajas en Excel (.xlsx)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/cash-registers?format=xlsx')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('10.12 — Reporte de Cajas en PDF (.pdf)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/reports/cash-registers?format=pdf')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.headers['content-type']).toContain('application/pdf');
    });

    it('10.13 — Reportes sin token devuelven 401', async () => {
      await request(app.getHttpServer())
        .get('/api/reports/movements')
        .expect(401);
    });
  });

  // ============================================================
  // SECCIÓN 11: CLEANUP Y RESUMEN FINAL
  // ============================================================
  describe('11. Cleanup y Resumen Final', () => {
    it('11.1 — Los datos de test existen y están consistentes', async () => {
      const [clientRes, accountRes] = await Promise.all([
        request(app.getHttpServer())
          .get(`/api/clients/${clientId}`)
          .set('Authorization', `Bearer ${adminToken}`),
        request(app.getHttpServer())
          .get(`/api/accounts/${accountId}`)
          .set('Authorization', `Bearer ${adminToken}`),
      ]);

      expect(clientRes.status).toBe(200);
      expect(accountRes.status).toBe(200);

      console.log('\n📊 Resumen de tests E2E NexoCaja:');
      console.log(`   Cliente: ${clientRes.body.data.firstName} ${clientRes.body.data.lastName} (${clientId})`);
      console.log(`   Cuenta: ${accountRes.body.data.accountNumber} — Saldo Final: $${Number(accountRes.body.data.balance).toFixed(2)}`);
      console.log(`   Cajero creado: maria.${uniqueId}@nexocaja.local (${cashierUserId})`);
    });
  });
});
