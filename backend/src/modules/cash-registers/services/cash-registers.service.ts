import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OpenCashRegisterDto } from '../dto/open-cash-register.dto';
import { CloseCashRegisterDto } from '../dto/close-cash-register.dto';

@Injectable()
export class CashRegistersService {
  constructor(private readonly prisma: PrismaService) {}

  async open(userId: string, dto: OpenCashRegisterDto) {
    const activeRegister = await this.prisma.cashRegister.findFirst({
      where: { userId, status: 'OPEN' },
    });

    if (activeRegister) {
      throw new ConflictException('Ya tienes una caja abierta.');
    }

    return this.prisma.cashRegister.create({
      data: {
        userId,
        openingBalance: dto.openingBalance,
        observations: dto.observations,
      },
    });
  }

  async close(userId: string, dto: CloseCashRegisterDto) {
    const activeRegister = await this.prisma.cashRegister.findFirst({
      where: { userId, status: 'OPEN' },
      include: {
        movements: true,
      },
    });

    if (!activeRegister) {
      throw new NotFoundException(
        'No tienes ninguna caja abierta para cerrar.',
      );
    }

    const openingBalance = Number(activeRegister.openingBalance);

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    activeRegister.movements.forEach((m) => {
      const amount = Number(m.amount);
      if (m.type === 'DEPOSIT') {
        totalDeposits += amount;
      } else if (m.type === 'WITHDRAWAL') {
        totalWithdrawals += amount;
      }
    });

    const closingBalance = openingBalance + totalDeposits - totalWithdrawals;

    return this.prisma.cashRegister.update({
      where: { id: activeRegister.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closingBalance,
        observations: dto.observations || activeRegister.observations,
      },
    });
  }

  async getCurrent(userId: string) {
    const register = await this.prisma.cashRegister.findFirst({
      where: { userId, status: 'OPEN' },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            account: true,
          },
        },
      },
    });

    if (!register) {
      throw new NotFoundException('No tienes una caja abierta actualmente.');
    }

    return register;
  }
}
