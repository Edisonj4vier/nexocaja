import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMovementDto } from '../dto/create-movement.dto';
import { QueryMovementDto } from '../dto/query-movement.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MovementsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const { page = 1, limit = 10, type, accountId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MovementWhereInput = {
      ...(type && { type }),
      ...(accountId && { accountId }),
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
            select: { accountNumber: true },
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
}
