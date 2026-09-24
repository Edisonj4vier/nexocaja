import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExportService } from '../../export/export.service';
import { PersonType, ClientStatus } from '@prisma/client';

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: {
    client: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    movement: {
      findMany: jest.Mock;
    };
  };
  let exportService: Partial<ExportService>;

  const mockClient = {
    id: 'client-1',
    memberCode: 'SOC-000001',
    personType: PersonType.NATURAL,
    identificationType: 'CEDULA',
    identificationNumber: '1712345678',
    firstName: 'Edison',
    lastName: 'Pérez',
    phone: '0987654321',
    email: 'edison@email.com',
    status: ClientStatus.ACTIVE,
    totalContributions: '20.00',
    createdAt: new Date(),
    accounts: [
      {
        id: 'acc-1',
        accountNumber: '210100000001',
        balance: '150.50',
        status: 'ACTIVE',
        product: { name: 'Cuenta Básica', code: 'AH-BASICA' },
      },
      {
        id: 'acc-2',
        accountNumber: '210100000002',
        balance: '50.00',
        status: 'INACTIVE',
        product: { name: 'Ahorro Programado', code: 'AH-PROG' },
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      client: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      movement: {
        findMany: jest.fn(),
      },
    };

    exportService = {
      toExcel: jest.fn(),
      toPdf: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExportService, useValue: exportService },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      personType: PersonType.NATURAL,
      identificationType: 'CEDULA',
      identificationNumber: '1799887766',
      firstName: 'María',
      lastName: 'López',
      phone: '0999112233',
    };

    it('should generate next member code and create client', async () => {
      prisma.client.findUnique.mockResolvedValue(null);
      prisma.client.count.mockResolvedValue(4);
      prisma.client.create.mockResolvedValue({
        id: 'client-new',
        memberCode: 'SOC-000005',
        ...createDto,
        status: ClientStatus.ACTIVE,
      });

      const result = await service.create(createDto as any);

      expect(prisma.client.findUnique).toHaveBeenCalledWith({
        where: { identificationNumber: '1799887766' },
      });
      expect(prisma.client.create).toHaveBeenCalled();
      expect(result.memberCode).toBe('SOC-000005');
    });

    it('should throw ConflictException if identification already exists', async () => {
      prisma.client.findUnique.mockResolvedValue(mockClient);

      await expect(service.create(createDto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should calculate pagination metadata correctly (total, totalPages)', async () => {
      prisma.client.count.mockResolvedValue(25);
      prisma.client.findMany.mockResolvedValue([mockClient]);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(prisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne360', () => {
    it('should return member 360 profile with consolidated savings and movements', async () => {
      prisma.client.findUnique.mockResolvedValue(mockClient);
      const mockMovements = [
        { id: 'mov-1', type: 'DEPOSIT', amount: '100.00', createdAt: new Date() },
      ];
      prisma.movement.findMany.mockResolvedValue(mockMovements);

      const result = await service.findOne360('client-1');

      expect(result.id).toBe('client-1');
      expect(result.summary.totalSavings).toBe(150.5); // only active accounts
      expect(result.summary.accountsCount).toBe(2);
      expect(result.summary.activeAccountsCount).toBe(1);
      expect(result.recentMovements).toEqual(mockMovements);
    });

    it('should throw NotFoundException if client does not exist', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(service.findOne360('non-existing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
