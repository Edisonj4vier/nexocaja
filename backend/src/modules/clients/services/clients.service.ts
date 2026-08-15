import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { QueryClientDto } from '../dto/query-client.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    const existingClient = await this.prisma.client.findUnique({
      where: { identificationNumber: dto.identificationNumber },
    });

    if (existingClient) {
      throw new ConflictException(
        'Ya existe un cliente con esta identificación.',
      );
    }

    const client = await this.prisma.client.create({
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
      },
    });

    return client;
  }

  async findAll(query: QueryClientDto) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      identificationNumber,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {
      ...(status && { status }),
      ...(identificationNumber && { identificationNumber }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { identificationNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado.');
    }

    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    const client = await this.findOne(id);

    if (
      dto.identificationNumber &&
      dto.identificationNumber !== client.identificationNumber
    ) {
      const existingClient = await this.prisma.client.findUnique({
        where: { identificationNumber: dto.identificationNumber },
      });

      if (existingClient) {
        throw new ConflictException(
          'Ya existe otro cliente con esta identificación.',
        );
      }
    }

    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });

    return updated;
  }
}
