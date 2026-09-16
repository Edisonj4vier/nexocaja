import { Module } from '@nestjs/common';
import { FinancialProductsController } from './controllers/financial-products.controller';
import { FinancialProductsService } from './services/financial-products.service';

@Module({
  controllers: [FinancialProductsController],
  providers: [FinancialProductsService],
  exports: [FinancialProductsService],
})
export class FinancialProductsModule {}
