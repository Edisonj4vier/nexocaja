import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CloseCashRegisterDto {
  @ApiPropertyOptional({ description: 'Observaciones al cerrar' })
  @IsString()
  @IsOptional()
  observations?: string;
}
