import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { QueryAccountDto } from '../dto/query-account.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const { page = 1, limit = 10, status, accountNumber, clientId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AccountWhereInput = {
      ...(status && { status }),
      ...(accountNumber && { accountNumber }),
      ...(clientId && { clientId }),
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
}
