import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExportService } from '../../export/export.service';
import { CreateMovementDto } from '../dto/create-movement.dto';
import { QueryMovementDto } from '../dto/query-movement.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MovementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: ExportService,
  ) {}

  private async getActiveRegister(userId: string) {
    const register = await this.prisma.cashRegister.findFirst({
      where: { userId, status: 'OPEN' },
    });
    if (!register) {
      throw new BadRequestException(
        'Debes tener una caja abierta para realizar transacciones.',
      );
    }
    return register;
  }

  async deposit(userId: string, dto: CreateMovementDto) {
    const cashRegister = await this.getActiveRegister(userId);

    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) throw new NotFoundException('Cuenta no encontrada.');
    if (account.status !== 'ACTIVE')
      throw new BadRequestException('La cuenta está inactiva.');

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.movement.create({
        data: {
          type: 'DEPOSIT',
          amount: dto.amount,
          accountId: account.id,
          cashRegisterId: cashRegister.id,
          userId,
          observations: dto.observations,
        },
      });

      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: {
            increment: dto.amount,
          },
        },
      });

      return movement;
    });
  }

  async withdrawal(userId: string, dto: CreateMovementDto) {
    const cashRegister = await this.getActiveRegister(userId);

    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) throw new NotFoundException('Cuenta no encontrada.');
    if (account.status !== 'ACTIVE')
      throw new BadRequestException('La cuenta está inactiva.');

    if (Number(account.balance) < dto.amount) {
      throw new BadRequestException(
        'Saldo insuficiente en la cuenta para realizar el retiro.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.movement.create({
        data: {
          type: 'WITHDRAWAL',
          amount: dto.amount,
          accountId: account.id,
          cashRegisterId: cashRegister.id,
          userId,
          observations: dto.observations,
        },
      });

      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: {
            decrement: dto.amount,
          },
        },
      });

      return movement;
    });
  }

  async findAll(query: QueryMovementDto) {
    const { page = 1, limit = 10, type, accountId, search, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MovementWhereInput = {
      ...(type && { type }),
      ...(accountId && { accountId }),
      ...(search && {
        OR: [
          { account: { accountNumber: { contains: search, mode: 'insensitive' } } },
          { account: { client: { firstName: { contains: search, mode: 'insensitive' } } } },
          { account: { client: { lastName: { contains: search, mode: 'insensitive' } } } },
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
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
      this.prisma.movement.count({ where }),
      this.prisma.movement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
          account: {
            select: {
              accountNumber: true,
              client: {
                select: {
                  firstName: true,
                  lastName: true,
                  identificationNumber: true,
                },
              },
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

  async export(query: QueryMovementDto, format: 'excel' | 'pdf') {
    const { type, accountId, search, startDate, endDate } = query;
    const where: Prisma.MovementWhereInput = {
      ...(type && { type }),
      ...(accountId && { accountId }),
      ...(search && {
        OR: [
          { account: { accountNumber: { contains: search, mode: 'insensitive' } } },
          { account: { client: { firstName: { contains: search, mode: 'insensitive' } } } },
          { account: { client: { lastName: { contains: search, mode: 'insensitive' } } } },
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
          ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
        },
      }),
    };

    const movements = await this.prisma.movement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        account: {
          include: { client: true },
        },
      },
    });

    const data = movements.map((m) => ({
      date: m.createdAt.toLocaleString(),
      type: m.type === 'DEPOSIT' ? 'Depósito' : 'Retiro',
      accountNumber: m.account.accountNumber,
      client: `${m.account.client.lastName} ${m.account.client.firstName}`,
      amount: m.amount.toString(),
      user: `${m.user.lastName} ${m.user.firstName}`,
    }));

    const columns = [
      { header: 'Fecha', key: 'date', width: 20 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'N° de Cuenta', key: 'accountNumber', width: 20 },
      { header: 'Cliente', key: 'client', width: 35 },
      { header: 'Monto ($)', key: 'amount', width: 15 },
      { header: 'Cajero', key: 'user', width: 25 },
    ];

    if (format === 'excel') {
      return this.exportService.generateExcel(columns, data);
    } else {
      return this.exportService.generatePdf('Reporte de Movimientos', columns, data);
    }
  }
}
