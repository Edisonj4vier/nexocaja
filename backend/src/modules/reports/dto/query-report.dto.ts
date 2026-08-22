import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportFormat {
  JSON = 'json',
  XLSX = 'xlsx',
  PDF = 'pdf',
}

export class QueryReportDto {
  @ApiPropertyOptional({ enum: ReportFormat, default: ReportFormat.JSON })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.JSON;

  @ApiPropertyOptional({ description: 'Fecha inicio (YYYY-MM-DD o ISO)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha fin (YYYY-MM-DD o ISO)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filtro por estado' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filtro por tipo de movimiento (DEPOSIT | WITHDRAWAL)',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'ID de la cuenta' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ description: 'ID de la caja registradora' })
  @IsOptional()
  @IsString()
  cashRegisterId?: string;

  @ApiPropertyOptional({ description: 'ID del usuario/cajero' })
  @IsOptional()
  @IsString()
  userId?: string;
}
