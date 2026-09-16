import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { QueryAccountDto } from '../dto/query-account.dto';
import { ExportService } from '../../export/export.service';
import { QueryAccountDto } from '../dto/query-account.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: ExportService,
  ) {}

  private async generateUniqueAccountNumber(): Promise<string> {
    let isUnique = false;
    let accountNumber = '';

    while (!isUnique) {
      accountNumber = Math.floor(
        1000000000 + Math.random() * 9000000000,
      ).toString();

      const existing = await this.prisma.account.findUnique({
        where: { accountNumber },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return accountNumber;
  }

  async create(dto: CreateAccountDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado.');
    }

    const accountNumber = await this.generateUniqueAccountNumber();

    const account = await this.prisma.account.create({
      data: {
        clientId: dto.clientId,
        accountNumber,
        balance: 0,
      },
    });

    return account;
  }

  async findAll(query: QueryAccountDto) {
    const { page = 1, limit = 10, status, accountNumber, clientId, search, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AccountWhereInput = {
      ...(status && { status }),
      ...(accountNumber && { accountNumber }),
      ...(clientId && { clientId }),
      ...(search && {
        OR: [
          { accountNumber: { contains: search, mode: 'insensitive' } },
          { client: { firstName: { contains: search, mode: 'insensitive' } } },
          { client: { lastName: { contains: search, mode: 'insensitive' } } },
          { client: { identificationNumber: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
          ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
        },
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.account.count({ where }),
      this.prisma.account.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              identificationNumber: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Cuenta no encontrada.');
    }

    return account;
  }

  async toggleStatus(id: string) {
    const account = await this.findOne(id);

    const newStatus = account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const updated = await this.prisma.account.update({
      where: { id },
      data: { status: newStatus },
    });

    return updated;
  }

  async export(query: QueryAccountDto, format: 'excel' | 'pdf') {
    const { status, accountNumber, clientId, search, startDate, endDate } = query;
    const where: Prisma.AccountWhereInput = {
      ...(status && { status }),
      ...(accountNumber && { accountNumber }),
      ...(clientId && { clientId }),
      ...(search && {
        OR: [
          { accountNumber: { contains: search, mode: 'insensitive' } },
          { client: { firstName: { contains: search, mode: 'insensitive' } } },
          { client: { lastName: { contains: search, mode: 'insensitive' } } },
          { client: { identificationNumber: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
          ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
        },
      }),
    };

    const accounts = await this.prisma.account.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });

    const data = accounts.map((a) => ({
      accountNumber: a.accountNumber,
      client: `${a.client.lastName} ${a.client.firstName}`,
      balance: a.balance.toString(),
      status: a.status,
      createdAt: a.createdAt.toLocaleString(),
    }));

    const columns = [
      { header: 'N° de Cuenta', key: 'accountNumber', width: 25 },
      { header: 'Cliente', key: 'client', width: 40 },
      { header: 'Saldo ($)', key: 'balance', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Apertura', key: 'createdAt', width: 20 },
    ];

    if (format === 'excel') {
      return this.exportService.generateExcel(columns, data);
    } else {
      return this.exportService.generatePdf('Reporte de Cuentas', columns, data);
    }
  }
}
