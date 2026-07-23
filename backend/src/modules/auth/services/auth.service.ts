import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly INVALID_CREDENTIALS_MESSAGE = 'Credenciales inválidas';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async validateUser(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(this.INVALID_CREDENTIALS_MESSAGE);
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('El usuario se encuentra deshabilitado.');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(this.INVALID_CREDENTIALS_MESSAGE);
    }
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = this.configService.getOrThrow<string>('expiresIn');

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLogin: new Date(),
      },
    });

    return {
      accessToken,
      expiresIn: expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    };
  }
}
