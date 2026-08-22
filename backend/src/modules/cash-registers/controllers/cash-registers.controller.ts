import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CashRegistersService } from '../services/cash-registers.service';
import { OpenCashRegisterDto } from '../dto/open-cash-register.dto';
import { CloseCashRegisterDto } from '../dto/close-cash-register.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorators';

@ApiTags('Cash Registers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cash-registers')
export class CashRegistersController {
  constructor(private readonly cashRegistersService: CashRegistersService) {}

  @Roles('ADMIN', 'CASHIER')
  @Post('open')
  open(@CurrentUser() user: { id: string }, @Body() dto: OpenCashRegisterDto) {
    return this.cashRegistersService.open(user.id, dto);
  }

  @Roles('ADMIN', 'CASHIER')
  @Post('close')
  close(
    @CurrentUser() user: { id: string },
    @Body() dto: CloseCashRegisterDto,
  ) {
    return this.cashRegistersService.close(user.id, dto);
  }

  @Roles('ADMIN', 'CASHIER')
  @Get('current')
  getCurrent(@CurrentUser() user: { id: string }) {
    return this.cashRegistersService.getCurrent(user.id);
  }
}
