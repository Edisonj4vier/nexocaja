import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { CashRegistersModule } from './modules/cash-registers/cash-registers.module';
import { MovementsModule } from './modules/movements/movements.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    RolesModule,
    ClientsModule,
    AccountsModule,
    CashRegistersModule,
    MovementsModule,
    DashboardModule,
    ReportsModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
