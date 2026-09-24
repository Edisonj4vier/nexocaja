import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FinancialProductsService } from './financial-products.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProductType } from '@prisma/client';

describe('FinancialProductsService', () => {
  let service: FinancialProductsService;
  let prisma: {
    financialProduct: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockProduct = {
    id: 'prod-uuid-1',
    code: 'AH-BASICA',
    name: 'Cuenta de Ahorros Básica',
    type: ProductType.SAVINGS,
    interestRate: 2.5,
    interestPeriodicity: 'MENSUAL',
    minOpeningAmount: 10,
    minBalance: 5,
    accountingAccount: '210101',
    accountingInterest: '510201',
    accountingCash: '110101',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    prisma = {
      financialProduct: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FinancialProductsService>(FinancialProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findActive', () => {
    it('should return only active financial products ordered by name', async () => {
      prisma.financialProduct.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findActive();

      expect(prisma.financialProduct.findMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a product by ID with account counts', async () => {
      prisma.financialProduct.findUnique.mockResolvedValue({
        ...mockProduct,
        _count: { accounts: 5 },
      });

      const result = await service.findOne('prod-uuid-1');

      expect(prisma.financialProduct.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-uuid-1' },
        include: { _count: { select: { accounts: true } } },
      });
      expect(result.code).toBe('AH-BASICA');
    });

    it('should throw NotFoundException if product is not found', async () => {
      prisma.financialProduct.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      code: 'AH-JOVEN',
      name: 'Ahorro Joven',
      type: ProductType.SAVINGS,
      interestRate: 3.0,
      interestPeriodicity: 'MENSUAL',
      minOpeningAmount: 15,
      minBalance: 5,
    };

    it('should successfully create a new financial product', async () => {
      prisma.financialProduct.findUnique.mockResolvedValue(null);
      prisma.financialProduct.create.mockResolvedValue({
        id: 'new-prod-id',
        ...createDto,
        status: 'ACTIVE',
      });

      const result = await service.create(createDto);

      expect(prisma.financialProduct.findUnique).toHaveBeenCalledWith({
        where: { code: 'AH-JOVEN' },
      });
      expect(prisma.financialProduct.create).toHaveBeenCalled();
      expect(result.id).toBe('new-prod-id');
    });

    it('should throw ConflictException if product code already exists', async () => {
      prisma.financialProduct.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create({ ...createDto, code: 'AH-BASICA' })).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
