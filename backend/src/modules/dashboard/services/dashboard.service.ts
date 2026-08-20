import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalClients,
      activeAccounts,
      totalUsers,
      todayDepositsAgg,
      todayWithdrawalsAgg,
      currentCashRegister,
      recentMovements,
    ] = await Promise.all([
      this.prisma.client.count(),
      this.prisma.account.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count(),
      this.prisma.movement.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: {
          type: 'DEPOSIT',
          createdAt: { gte: today },
        },
      }),
      this.prisma.movement.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: {
          type: 'WITHDRAWAL',
          createdAt: { gte: today },
        },
      }),
      this.prisma.cashRegister.findFirst({
        where: {
          userId,
          status: 'OPEN',
        },
        include: {
          movements: true,
        },
      }),
      this.prisma.movement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          account: {
            include: {
              client: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    let cashRegisterBalance = 0;
    if (currentCashRegister) {
      const opening = Number(currentCashRegister.openingBalance);
      const deposits = currentCashRegister.movements
        .filter((m) => m.type === 'DEPOSIT')
        .reduce((sum, m) => sum + Number(m.amount), 0);
      const withdrawals = currentCashRegister.movements
        .filter((m) => m.type === 'WITHDRAWAL')
        .reduce((sum, m) => sum + Number(m.amount), 0);
      cashRegisterBalance = opening + deposits - withdrawals;
    }

    return {
      totalClients,
      activeAccounts,
      totalUsers,
      todayDeposits: {
        total: Number(todayDepositsAgg._sum.amount || 0),
        count: todayDepositsAgg._count.id || 0,
      },
      todayWithdrawals: {
        total: Number(todayWithdrawalsAgg._sum.amount || 0),
        count: todayWithdrawalsAgg._count.id || 0,
      },
      currentCashRegister: currentCashRegister
        ? {
            id: currentCashRegister.id,
            status: currentCashRegister.status,
            openingBalance: Number(currentCashRegister.openingBalance),
            currentBalance: cashRegisterBalance,
            openedAt: currentCashRegister.openedAt,
            movementsCount: currentCashRegister.movements.length,
          }
        : null,
      recentMovements,
    };
  }
}
