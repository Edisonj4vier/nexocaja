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
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClientsService } from '../services/clients.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { QueryClientDto } from '../dto/query-client.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Roles('ADMIN', 'CASHIER')
  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get()
  findAll(@Query() query: QueryClientDto) {
    return this.clientsService.findAll(query);
  }

  @Get('export/excel')
  async exportExcel(@Query() query: QueryClientDto, @Res() res: Response) {
    const buffer = await this.clientsService.export(query, 'excel');
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=clientes.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('export/pdf')
  async exportPdf(@Query() query: QueryClientDto, @Res() res: Response) {
    const buffer = await this.clientsService.export(query, 'pdf');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=clientes.pdf',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }
}
