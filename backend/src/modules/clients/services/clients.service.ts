import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExportService } from '../../export/export.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { QueryClientDto } from '../dto/query-client.dto';
import { Prisma, PersonType, ClientStatus } from '@prisma/client';
import { validateIdentification } from '../../../common/validators/ecuadorian-id.validator';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exportService: ExportService,
  ) {}

  private async generateNextMemberCode(): Promise<string> {
    const count = await this.prisma.client.count();
    let nextNum = count + 1;
    let code = `SOC-${String(nextNum).padStart(6, '0')}`;
    let exists = await this.prisma.client.findUnique({ where: { memberCode: code } });

    while (exists) {
      nextNum++;
      code = `SOC-${String(nextNum).padStart(6, '0')}`;
      exists = await this.prisma.client.findUnique({ where: { memberCode: code } });
    }

    return code;
  }

  async create(dto: CreateClientDto) {
    const idValidation = validateIdentification(dto.identificationType, dto.identificationNumber);
    if (!idValidation.isValid) {
      throw new BadRequestException(idValidation.error || 'Número de identificación no válido.');
    }

    const existingClient = await this.prisma.client.findUnique({
      where: { identificationNumber: dto.identificationNumber },
    });

    if (existingClient) {
      throw new ConflictException(
        'Ya existe un socio con esta identificación.',
      );
    }

    const memberCode = dto.memberCode || (await this.generateNextMemberCode());

    const client = await this.prisma.client.create({
      data: {
        personType: dto.personType || PersonType.NATURAL,
        memberCode,
        identificationType: dto.identificationType,
        identificationNumber: dto.identificationNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        secondaryPhone: dto.secondaryPhone,
        email: dto.email,
        address: dto.address,
        province: dto.province,
        city: dto.city,
        parish: dto.parish,
        addressReference: dto.addressReference,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        nationality: dto.nationality || 'Ecuatoriana',
        occupation: dto.occupation,
        profession: dto.profession,
        employerCompany: dto.employerCompany,
        monthlyIncome: dto.monthlyIncome ? new Prisma.Decimal(dto.monthlyIncome) : null,
        economicActivity: dto.economicActivity,
        workAddress: dto.workAddress,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactRelationship: dto.emergencyContactRelationship,
        emergencyContactPhone: dto.emergencyContactPhone,
        memberType: dto.memberType || 'ACTIVO',
        affiliationDate: dto.affiliationDate ? new Date(dto.affiliationDate) : new Date(),
        totalContributions: dto.totalContributions ? new Prisma.Decimal(dto.totalContributions) : new Prisma.Decimal(0),
        agency: dto.agency || 'Matriz',
        status: dto.status || ClientStatus.ACTIVE,
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
          { memberCode: { contains: search, mode: 'insensitive' } },
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
        include: {
          _count: {
            select: { accounts: true },
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
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        accounts: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Socio no encontrado.');
    }

    return client;
  }

  async findOne360(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        accounts: {
          include: {
            product: true,
            beneficiaries: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Socio no encontrado.');
    }

    // Get all movements for all accounts of this client
    const accountIds = client.accounts.map((a) => a.id);
    const movements = await this.prisma.movement.findMany({
      where: {
        accountId: { in: accountIds },
      },
      include: {
        account: {
          select: { accountNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Calculate total savings (sum of active account balances)
    const totalSavings = client.accounts
      .filter((a) => a.status === 'ACTIVE')
      .reduce((acc, curr) => acc + Number(curr.balance), 0);

    return {
      ...client,
      summary: {
        totalSavings,
        totalContributions: Number(client.totalContributions),
        accountsCount: client.accounts.length,
        activeAccountsCount: client.accounts.filter((a) => a.status === 'ACTIVE').length,
        recentMovementsCount: movements.length,
      },
      recentMovements: movements,
    };
  }

  async update(id: string, dto: UpdateClientDto) {
    const current = await this.findOne(id);

    if (dto.identificationNumber) {
      const typeToCheck = dto.identificationType || current.identificationType;
      const idValidation = validateIdentification(typeToCheck, dto.identificationNumber);
      if (!idValidation.isValid) {
        throw new BadRequestException(idValidation.error || 'Número de identificación no válido.');
      }

      const existing = await this.prisma.client.findFirst({
        where: {
          identificationNumber: dto.identificationNumber,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Ya existe otro socio con esta identificación.',
        );
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        monthlyIncome: dto.monthlyIncome !== undefined ? new Prisma.Decimal(dto.monthlyIncome) : undefined,
        totalContributions: dto.totalContributions !== undefined ? new Prisma.Decimal(dto.totalContributions) : undefined,
      },
    });
  }

  async toggleStatus(id: string) {
    const client = await this.findOne(id);
    const newStatus =
      client.status === ClientStatus.ACTIVE
        ? ClientStatus.INACTIVE
        : ClientStatus.ACTIVE;

    return this.prisma.client.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async export(param1: any, param2: any) {
    const format: 'excel' | 'pdf' = typeof param1 === 'string' ? param1 : param2;
    const query: QueryClientDto = typeof param1 === 'object' ? param1 : param2;
    const { status, search, identificationNumber, startDate, endDate } = query || {};

    const where: Prisma.ClientWhereInput = {
      ...(status && { status }),
      ...(identificationNumber && { identificationNumber }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { identificationNumber: { contains: search, mode: 'insensitive' } },
          { memberCode: { contains: search, mode: 'insensitive' } },
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
      orderBy: { lastName: 'asc' },
    });

    const columns = [
      { header: 'CÓDIGO', key: 'memberCode', width: 14 },
      { header: 'TIPO IDENT.', key: 'identificationType', width: 12 },
      { header: 'IDENTIFICACIÓN', key: 'identificationNumber', width: 16 },
      { header: 'APELLIDOS Y NOMBRES', key: 'fullName', width: 30 },
      { header: 'TELÉFONO', key: 'phone', width: 15 },
      { header: 'EMAIL', key: 'email', width: 25 },
      { header: 'ESTADO', key: 'status', width: 12 },
      { header: 'FECHA REGISTRO', key: 'createdAt', width: 16 },
    ];

    const data = clients.map((c) => ({
      memberCode: c.memberCode || 'N/A',
      identificationType: c.identificationType,
      identificationNumber: c.identificationNumber,
      fullName: `${c.lastName} ${c.firstName}`,
      phone: c.phone || 'N/A',
      email: c.email || 'N/A',
      status: c.status,
      createdAt: c.createdAt.toISOString().split('T')[0],
    }));

    if (format === 'excel') {
      return this.exportService.generateExcel(columns, data);
    } else {
      return this.exportService.generatePdf(
        'Listado Oficial de Socios Registrados',
        columns,
        data,
      );
    }
  }
}
