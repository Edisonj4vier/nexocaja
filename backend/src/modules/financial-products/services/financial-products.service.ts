import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProductType } from '@prisma/client';

export interface CreateFinancialProductDto {
  code: string;
  name: string;
  type: ProductType;
  interestRate?: number;
  interestPeriodicity?: string;
  minOpeningAmount?: number;
  minBalance?: number;
  accountingAccount?: string;
  accountingInterest?: string;
  accountingCash?: string;
  status?: string;
}

@Injectable()
export class FinancialProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.financialProduct.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.financialProduct.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.financialProduct.findUnique({
      where: { id },
      include: {
        _count: {
          select: { accounts: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto financiero no encontrado.');
    }

    return product;
  }

  async create(dto: CreateFinancialProductDto) {
    const existing = await this.prisma.financialProduct.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException('Ya existe un producto financiero con este código.');
    }

    return this.prisma.financialProduct.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type || ProductType.SAVINGS,
        interestRate: dto.interestRate ?? 0,
        interestPeriodicity: dto.interestPeriodicity || 'MENSUAL',
        minOpeningAmount: dto.minOpeningAmount ?? 0,
        minBalance: dto.minBalance ?? 0,
        accountingAccount: dto.accountingAccount,
        accountingInterest: dto.accountingInterest,
        accountingCash: dto.accountingCash,
        status: dto.status || 'ACTIVE',
      },
    });
  }
}
