import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('El correo electrónico ya está en uso.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        roleId: dto.roleId,
      },
      include: { role: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 10, status, roleId, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(status && { status }),
      ...(roleId && { roleId }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map((u) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...rest } = u;
        return rest;
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // Valida que existe

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException(
          'El correo electrónico ya está en uso por otro usuario.',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async toggleStatus(id: string) {
    const user = await this.findOne(id);
    const newStatus =
      user.status === UserStatus.ACTIVE
        ? UserStatus.INACTIVE
        : UserStatus.ACTIVE;

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: newStatus },
      include: { role: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = updated;
    return result;
  }
}
