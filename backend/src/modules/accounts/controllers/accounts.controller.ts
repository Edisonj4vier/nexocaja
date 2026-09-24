import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { QueryAccountDto } from '../dto/query-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Roles('ADMIN', 'CASHIER')
  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.accountsService.create(dto);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get()
  findAll(@Query() query: QueryAccountDto) {
    return this.accountsService.findAll(query);
  }

  @Get('export/excel')
  async exportExcel(@Query() query: QueryAccountDto, @Res() res: Response) {
    const buffer = await this.accountsService.export(query, 'excel');
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=cuentas.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('export/pdf')
  async exportPdf(@Query() query: QueryAccountDto, @Res() res: Response) {
    const buffer = await this.accountsService.export(query, 'pdf');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=cuentas.pdf',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get(':id/statement')
  getStatement(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountsService.getAccountStatement(id, startDate, endDate);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get(':id/statement/pdf')
  async exportStatementPdf(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.accountsService.exportStatementPdf(id, startDate, endDate);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=estado-cuenta-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  toggleStatus(@Param('id') id: string) {
    return this.accountsService.toggleStatus(id);
  }
}

