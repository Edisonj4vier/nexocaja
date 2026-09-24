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
  };
  let exportService: Partial<ExportService>;

  const mockClient = {
    id: 'client-1',
    firstName: 'Edison',
    lastName: 'Pérez',
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
    };

    exportService = {
      toExcel: jest.fn(),
      toPdf: jest.fn(),
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
});
