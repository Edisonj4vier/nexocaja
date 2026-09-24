import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExportService } from '../../export/export.service';
import { AccountStatus } from '@prisma/client';

describe('AccountsService', () => {
  let service: AccountsService;
  let prisma: {
    account: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    client: {
      findUnique: jest.Mock;
    };
    financialProduct: {
      findUnique: jest.Mock;
    };
    movement: {
      findMany: jest.Mock;
    };
  };
  let exportService: {
    generateExcel: jest.Mock;
    generatePdf: jest.Mock;
    generateCooperativeStatementPdf: jest.Mock;
  };

  const mockClient = {
    id: 'client-1',
    firstName: 'Edison',
    lastName: 'Pérez',
    identificationNumber: '1712345678',
    phone: '0991234567',
    address: 'Quito, Pichincha',
    city: 'Quito',
    province: 'Pichincha',
    memberCode: 'SOC-000001',
  };

  const mockProduct = {
    id: 'prod-1',
    code: 'AH-BASICA',
    name: 'Ahorro Básico',
    interestRate: 2.5,
  };

  beforeEach(async () => {
    prisma = {
      account: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      client: {
        findUnique: jest.fn(),
      },
      financialProduct: {
        findUnique: jest.fn(),
      },
      movement: {
        findMany: jest.fn(),
      },
    };

    exportService = {
      generateExcel: jest.fn(),
      generatePdf: jest.fn(),
      generateCooperativeStatementPdf: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExportService, useValue: exportService },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      clientId: 'client-1',
      productId: 'prod-1',
      openingAmount: 50,
      agency: 'Matriz',
      beneficiaries: [
        {
          fullName: 'Ana Pérez',
          relationship: 'Hija',
          percentage: 100,
        },
      ],
    };

    it('should generate 12-digit account number starting with 2101 and create account', async () => {
      prisma.client.findUnique.mockResolvedValue(mockClient);
      prisma.account.count.mockResolvedValue(0);
      prisma.account.findUnique.mockResolvedValue(null);
      prisma.financialProduct.findUnique.mockResolvedValue(mockProduct);

      const expectedAccount = {
        id: 'acc-uuid',
        accountNumber: '210100000001',
        balance: 50,
        interestRate: 2.5,
        agency: 'Matriz',
        status: AccountStatus.ACTIVE,
      };
      prisma.account.create.mockResolvedValue(expectedAccount);

      const result = await service.create(createDto as any);

      expect(prisma.client.findUnique).toHaveBeenCalledWith({
        where: { id: 'client-1' },
      });
      expect(prisma.account.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            accountNumber: '210100000001',
            balance: 50,
            interestRate: 2.5,
            agency: 'Matriz',
          }),
        }),
      );
      expect(result.accountNumber).toBe('210100000001');
    });

    it('should throw NotFoundException if client does not exist', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should calculate pagination correctly and filter by status and query', async () => {
      prisma.account.count.mockResolvedValue(15);
      prisma.account.findMany.mockResolvedValue([
        { id: 'acc-1', accountNumber: '210100000001', balance: '100' },
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta).toEqual({
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getAccountStatement and exportStatementPdf', () => {
    const mockAccountWithClient = {
      id: 'acc-1',
      accountNumber: '210100000001',
      openingAmount: 100,
      balance: 350,
      status: AccountStatus.ACTIVE,
      openedAt: new Date('2026-01-01T10:00:00Z'),
      client: mockClient,
      product: mockProduct,
    };

    it('should throw NotFoundException if account not found', async () => {
      prisma.account.findUnique.mockResolvedValue(null);
      await expect(service.getAccountStatement('acc-nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should calculate initialBalance, running balance and conciliation accurately', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccountWithClient);

      // Prior movements before 2026-04-01
      prisma.movement.findMany
        .mockResolvedValueOnce([
          { type: 'DEPOSIT', amount: 50 },
          { type: 'WITHDRAWAL', amount: 20 },
        ])
        // Range movements between 2026-04-01 and 2026-04-30
        .mockResolvedValueOnce([
          {
            id: 'mov-1',
            type: 'DEPOSIT',
            amount: 200,
            observations: 'Depósito sueldo',
            createdAt: new Date('2026-04-05T14:30:00Z'),
            user: { firstName: 'Juan', lastName: 'Cajero' },
          },
          {
            id: 'mov-2',
            type: 'WITHDRAWAL',
            amount: 50,
            observations: 'Retiro cajero',
            createdAt: new Date('2026-04-10T09:15:00Z'),
            user: { firstName: 'Juan', lastName: 'Cajero' },
          },
        ]);

      const statement = await service.getAccountStatement('acc-1', '2026-04-01', '2026-04-30');

      // opening (100) + priorNet (50 - 20 = 30) = 130
      expect(statement.conciliation.saldoAnterior).toBe(130);
      expect(statement.conciliation.totalCreditos).toBe(200);
      expect(statement.conciliation.totalDebitos).toBe(50);
      // 130 + 200 - 50 = 280
      expect(statement.conciliation.saldoActual).toBe(280);

      expect(statement.movements).toHaveLength(2);
      expect(statement.movements[0].balance).toBe(330); // 130 + 200
      expect(statement.movements[1].balance).toBe(280); // 330 - 50
      expect(statement.movements[0].document).toContain('VCH-2026-');
      expect(statement.account.accountNumber).toBe('210100000001');
    });

    it('should export statement PDF buffer correctly', async () => {
      prisma.account.findUnique.mockResolvedValue(mockAccountWithClient);
      prisma.movement.findMany.mockResolvedValue([]);
      const dummyBuffer = Buffer.from('PDF_CONTENT');
      exportService.generateCooperativeStatementPdf.mockResolvedValue(dummyBuffer);

      const buffer = await service.exportStatementPdf('acc-1');
      expect(buffer).toBe(dummyBuffer);
      expect(exportService.generateCooperativeStatementPdf).toHaveBeenCalledWith(
        expect.objectContaining({
          account: expect.objectContaining({ accountNumber: '210100000001' }),
        }),
      );
    });
  });
});

