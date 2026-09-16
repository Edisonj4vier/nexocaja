import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBeneficiaryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  identificationNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ description: 'Porcentaje asignado (ej. 50)' })
  @IsNumber()
  percentage: number;
}

export class CreateAccountDto {
  @ApiProperty({ description: 'ID del socio propietario de la cuenta' })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiPropertyOptional({ description: 'ID del producto financiero (opcional)' })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ description: 'Monto de apertura inicial' })
  @IsNumber()
  @IsOptional()
  openingAmount?: number;

  @ApiPropertyOptional({ description: 'Agencia de apertura' })
  @IsString()
  @IsOptional()
  agency?: string;

  @ApiPropertyOptional({ type: [CreateBeneficiaryDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateBeneficiaryDto)
  beneficiaries?: CreateBeneficiaryDto[];
}
