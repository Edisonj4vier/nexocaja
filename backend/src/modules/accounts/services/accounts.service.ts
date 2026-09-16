import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { QueryAccountDto } from '../dto/query-account.dto';
import { ExportService } from '../../export/export.service';
import { Prisma, AccountStatus } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: ExportService,
  ) {}

  private async generateUniqueAccountNumber(): Promise<string> {
    const count = await this.prisma.account.count();
    let seq = count + 1;
    let accountNumber = `2101${String(seq).padStart(8, '0')}`;
    let existing = await this.prisma.account.findUnique({
      where: { accountNumber },
    });

    while (existing) {
      seq++;
      accountNumber = `2101${String(seq).padStart(8, '0')}`;
      existing = await this.prisma.account.findUnique({
        where: { accountNumber },
      });
    }

    return accountNumber;
  }

  async create(dto: CreateAccountDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Socio no encontrado.');
    }

    const accountNumber = await this.generateUniqueAccountNumber();

    let interestRate = 0;
    if (dto.productId) {
      const product = await this.prisma.financialProduct.findUnique({
        where: { id: dto.productId },
      });
      if (product) {
        interestRate = Number(product.interestRate);
      }
    }

    const openingBalance = dto.openingAmount ? Number(dto.openingAmount) : 0;

    const account = await this.prisma.account.create({
      data: {
        clientId: dto.clientId,
        productId: dto.productId,
        accountNumber,
        balance: openingBalance,
        openingAmount: openingBalance,
        interestRate,
        agency: dto.agency || 'Matriz',
        status: AccountStatus.ACTIVE,
        beneficiaries:
          dto.beneficiaries && dto.beneficiaries.length > 0
            ? {
                create: dto.beneficiaries.map((b) => ({
                  fullName: b.fullName,
                  identificationNumber: b.identificationNumber,
                  relationship: b.relationship,
                  percentage: new Prisma.Decimal(b.percentage),
                })),
              }
            : undefined,
      },
      include: {
        client: true,
        product: true,
        beneficiaries: true,
      },
    });

    return account;
  }

  async findAll(query: QueryAccountDto) {
    const {
      page = 1,
      limit = 10,
      status,
      accountNumber,
      clientId,
      search,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AccountWhereInput = {
      ...(status && { status: status as AccountStatus }),
      ...(accountNumber && { accountNumber }),
      ...(clientId && { clientId }),
      ...(search && {
        OR: [
          { accountNumber: { contains: search, mode: 'insensitive' } },
          { client: { firstName: { contains: search, mode: 'insensitive' } } },
          { client: { lastName: { contains: search, mode: 'insensitive' } } },
          { client: { identificationNumber: { contains: search, mode: 'insensitive' } } },
          { client: { memberCode: { contains: search, mode: 'insensitive' } } },
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
              id: true,
              firstName: true,
              lastName: true,
              identificationNumber: true,
              memberCode: true,
            },
          },
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
              interestRate: true,
            },
          },
          _count: {
            select: { movements: true },
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
        product: true,
        beneficiaries: true,
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Cuenta no encontrada.');
    }

    return account;
  }

  async toggleStatus(id: string) {
    const account = await this.findOne(id);
    const newStatus =
      account.status === AccountStatus.ACTIVE
        ? AccountStatus.BLOCKED
        : AccountStatus.ACTIVE;

    return this.prisma.account.update({
      where: { id },
      data: { status: newStatus },
      include: {
        product: true,
        client: true,
      },
    });
  }

  async export(param1: any, param2: any) {
    const format: 'excel' | 'pdf' = typeof param1 === 'string' ? param1 : param2;
    const query: QueryAccountDto = typeof param1 === 'object' ? param1 : param2;
    const { status, search, startDate, endDate } = query || {};

    const where: Prisma.AccountWhereInput = {
      ...(status && { status: status as AccountStatus }),
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
      include: {
        client: true,
        product: true,
      },
    });

    const columns = [
      { header: 'N° CUENTA', key: 'accountNumber', width: 18 },
      { header: 'PRODUCTO', key: 'productName', width: 25 },
      { header: 'SOCIO / TITULAR', key: 'clientName', width: 30 },
      { header: 'IDENTIFICACIÓN', key: 'clientDni', width: 16 },
      { header: 'SALDO', key: 'balance', width: 16 },
      { header: 'ESTADO', key: 'status', width: 14 },
      { header: 'FECHA APERTURA', key: 'openedAt', width: 16 },
    ];

    const data = accounts.map((a) => ({
      accountNumber: a.accountNumber,
      productName: a.product?.name || 'Ahorros Ordinaria',
      clientName: `${a.client.lastName} ${a.client.firstName}`,
      clientDni: a.client.identificationNumber,
      balance: `$${Number(a.balance).toFixed(2)}`,
      status: a.status,
      openedAt: a.openedAt.toISOString().split('T')[0],
    }));

    if (format === 'excel') {
      return this.exportService.generateExcel(columns, data);
    } else {
      return this.exportService.generatePdf(
        'Listado Oficial de Cuentas Financieras',
        columns,
        data,
      );
    }
  }
}
