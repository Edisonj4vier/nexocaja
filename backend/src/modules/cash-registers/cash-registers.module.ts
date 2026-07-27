import { Module } from '@nestjs/common';
import { CashRegistersController } from './controllers/cash-registers.controller';
import { CashRegistersService } from './services/cash-registers.service';

@Module({
  controllers: [CashRegistersController],
  providers: [CashRegistersService],
  exports: [CashRegistersService],
})
export class CashRegistersModule {}
