import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
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
  ],
})
export class AppModule {}
