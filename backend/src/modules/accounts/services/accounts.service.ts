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

  async getAccountStatement(accountId: string, startDate?: string, endDate?: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      include: {
        client: true,
        product: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Cuenta no encontrada.');
    }

    const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : null;

    const openingAmount = Number(account.openingAmount || 0);
    let saldoAnterior = openingAmount;

    if (start) {
      const priorMovements = await this.prisma.movement.findMany({
        where: {
          accountId: account.id,
          createdAt: { lt: start },
        },
        select: {
          type: true,
          amount: true,
        },
      });

      const priorNet = priorMovements.reduce((acc, m) => {
        const amt = Number(m.amount);
        return m.type === 'DEPOSIT' ? acc + amt : acc - amt;
      }, 0);

      saldoAnterior = openingAmount + priorNet;
    }

    const movements = await this.prisma.movement.findMany({
      where: {
        accountId: account.id,
        ...((start || end) && {
          createdAt: {
            ...(start && { gte: start }),
            ...(end && { lte: end }),
          },
        }),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    let currentRunningBalance = saldoAnterior;
    let totalCreditos = 0;
    let totalDebitos = 0;

    const statementMovements = movements.map((m) => {
      const amount = Number(m.amount);
      const isDeposit = m.type === 'DEPOSIT';
      const debit = isDeposit ? 0 : amount;
      const credit = isDeposit ? amount : 0;

      if (isDeposit) {
        currentRunningBalance += amount;
        totalCreditos += amount;
      } else {
        currentRunningBalance -= amount;
        totalDebitos += amount;
      }

      const created = new Date(m.createdAt);
      const day = String(created.getUTCDate()).padStart(2, '0');
      const month = String(created.getUTCMonth() + 1).padStart(2, '0');
      const year = created.getUTCFullYear();
      const dateStr = `${day}-${month}-${year}`;

      const hours = String(created.getUTCHours()).padStart(2, '0');
      const minutes = String(created.getUTCMinutes()).padStart(2, '0');
      const seconds = String(created.getUTCSeconds()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}:${seconds}`;

      const docNumber = `VCH-${year}-${m.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
      const cashierName = m.user ? `${m.user.firstName} ${m.user.lastName}` : 'Cajero';

      return {
        id: m.id,
        date: dateStr,
        time: timeStr,
        createdAt: m.createdAt,
        type: m.type,
        transaction: isDeposit ? 'DEPÓSITO EN EFECTIVO' : 'RETIRO CON LIBRETA',
        detail: m.observations || `${isDeposit ? 'Depósito en ventanilla' : 'Retiro en ventanilla'} (${cashierName})`,
        document: docNumber,
        debit,
        credit,
        amount,
        balance: currentRunningBalance,
        cashierName,
      };
    });

    const formattedStartDate = startDate || (movements.length > 0 ? statementMovements[0].date : new Date(account.openedAt).toISOString().split('T')[0]);
    const formattedEndDate = endDate || new Date().toISOString().split('T')[0];

    return {
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        productName: account.product?.name || 'Ahorros Ordinaria',
        productType: account.product?.type || 'SAVINGS',
        agency: account.agency || 'Matriz',
        status: account.status,
        interestRate: Number(account.interestRate || account.product?.interestRate || 0),
        openedAt: account.openedAt,
      },
      client: {
        id: account.client.id,
        fullName: `${account.client.lastName} ${account.client.firstName}`,
        firstName: account.client.firstName,
        lastName: account.client.lastName,
        identificationNumber: account.client.identificationNumber,
        phone: account.client.phone || account.client.secondaryPhone || 'S/N',
        address: account.client.address || (account.client.city ? `${account.client.city}, ${account.client.province || ''}` : 'Quito, Ecuador'),
        city: account.client.city,
        province: account.client.province,
        memberCode: account.client.memberCode || 'SOC-000000',
      },
      period: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
      conciliation: {
        saldoAnterior,
        totalCreditos,
        totalDebitos,
        saldoActual: currentRunningBalance,
        saldoPromedio: (saldoAnterior + currentRunningBalance) / 2,
      },
      movements: statementMovements,
    };
  }

  async exportStatementPdf(accountId: string, startDate?: string, endDate?: string) {
    const statement = await this.getAccountStatement(accountId, startDate, endDate);
    return this.exportService.generateCooperativeStatementPdf(statement);
  }
}

