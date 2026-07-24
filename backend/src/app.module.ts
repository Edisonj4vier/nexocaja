import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: configuration,
      validationSchema,
      expandVariables: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
  ],
})
export class AppModule {}
