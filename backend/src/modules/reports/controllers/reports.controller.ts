import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { QueryReportDto } from '../dto/query-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles('ADMIN', 'CASHIER')
  @Get('clients')
  async getClientsReport(
    @Query() query: QueryReportDto,
    @Res() res: Response,
  ) {
    if (query.format === 'xlsx' || query.format === 'pdf') {
      return this.reportsService.getClientsReport(query, res);
    }
    const data = await this.reportsService.getClientsReport(query);
    return res.json(data);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get('accounts')
  async getAccountsReport(
    @Query() query: QueryReportDto,
    @Res() res: Response,
  ) {
    if (query.format === 'xlsx' || query.format === 'pdf') {
      return this.reportsService.getAccountsReport(query, res);
    }
    const data = await this.reportsService.getAccountsReport(query);
    return res.json(data);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get('movements')
  async getMovementsReport(
    @Query() query: QueryReportDto,
    @Res() res: Response,
  ) {
    if (query.format === 'xlsx' || query.format === 'pdf') {
      return this.reportsService.getMovementsReport(query, res);
    }
    const data = await this.reportsService.getMovementsReport(query);
    return res.json(data);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get('cash-registers')
  async getCashRegistersReport(
    @Query() query: QueryReportDto,
    @Res() res: Response,
  ) {
    if (query.format === 'xlsx' || query.format === 'pdf') {
      return this.reportsService.getCashRegistersReport(query, res);
    }
    const data = await this.reportsService.getCashRegistersReport(query);
    return res.json(data);
  }
}
