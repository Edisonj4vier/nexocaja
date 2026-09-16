import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FinancialProductsService } from '../services/financial-products.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('financial-products')
@UseGuards(JwtAuthGuard)
export class FinancialProductsController {
  constructor(private readonly productsService: FinancialProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.findActive();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() body: any) {
    return this.productsService.create(body);
  }
}
