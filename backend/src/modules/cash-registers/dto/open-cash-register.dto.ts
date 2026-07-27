import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OpenCashRegisterDto {
  @ApiProperty({ description: 'Saldo inicial de caja' })
  @IsNumber()
  @Min(0)
  openingBalance: number;

  @ApiPropertyOptional({ description: 'Observaciones al abrir' })
  @IsString()
  @IsOptional()
  observations?: string;
}
