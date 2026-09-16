import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExportService } from '../../export/export.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { QueryClientDto } from '../dto/query-client.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: ExportService,
  ) {}

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
      startDate,
      endDate,
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
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
          ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
        },
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

  async export(query: QueryClientDto, format: 'excel' | 'pdf') {
    const { status, search, identificationNumber, startDate, endDate } = query;
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
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
          ...(endDate && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
        },
      }),
    };

    const clients = await this.prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const data = clients.map((c) => ({
      name: `${c.lastName} ${c.firstName}`,
      identificationNumber: c.identificationNumber,
      status: c.status,
      createdAt: c.createdAt.toLocaleString(),
    }));

    const columns = [
      { header: 'Cliente', key: 'name', width: 40 },
      { header: 'Identificación', key: 'identificationNumber', width: 25 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Fecha Registro', key: 'createdAt', width: 20 },
    ];

    if (format === 'excel') {
      return this.exportService.generateExcel(columns, data);
    } else {
      return this.exportService.generatePdf('Reporte de Clientes', columns, data);
    }
  }
}
