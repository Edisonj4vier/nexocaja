import { Controller, Get, Post, Body, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MovementsService } from '../services/movements.service';
import { CreateMovementDto } from '../dto/create-movement.dto';
import { QueryMovementDto } from '../dto/query-movement.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorators';

@ApiTags('Movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Roles('ADMIN', 'CASHIER')
  @Post('deposit')
  deposit(@CurrentUser() user: { id: string }, @Body() dto: CreateMovementDto) {
    return this.movementsService.deposit(user.id, dto);
  }

  @Roles('ADMIN', 'CASHIER')
  @Post('withdrawal')
  withdrawal(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMovementDto,
  ) {
    return this.movementsService.withdrawal(user.id, dto);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get()
  findAll(@Query() query: QueryMovementDto) {
    return this.movementsService.findAll(query);
  }

  @Get('export/excel')
  async exportExcel(@Query() query: QueryMovementDto, @Res() res: Response) {
    const buffer = await this.movementsService.export(query, 'excel');
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=movimientos.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('export/pdf')
  async exportPdf(@Query() query: QueryMovementDto, @Res() res: Response) {
    const buffer = await this.movementsService.export(query, 'pdf');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=movimientos.pdf',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}
