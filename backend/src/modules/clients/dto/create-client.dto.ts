import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PersonType, ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @ApiPropertyOptional({ enum: PersonType, default: PersonType.NATURAL })
  @IsEnum(PersonType)
  @IsOptional()
  personType?: PersonType;

  @ApiPropertyOptional({ description: 'Código de socio asignado (ej. SOC-000101)' })
  @IsString()
  @IsOptional()
  memberCode?: string;

  @ApiProperty({
    description: 'Tipo de identificación (ej. Cédula, RUC, Pasaporte)',
  })
  @IsString()
  @IsNotEmpty()
  identificationType: string;

  @ApiProperty({ description: 'Número de identificación único' })
  @IsString()
  @IsNotEmpty()
  identificationNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  secondaryPhone?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  parish?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  addressReference?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nationality?: string;

  // Socioeconomic
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profession?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  employerCompany?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  monthlyIncome?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  economicActivity?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  workAddress?: string;

  // Emergency contact
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emergencyContactRelationship?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  // Member info
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  memberType?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString()
  @IsOptional()
  affiliationDate?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : Number(value)))
  @IsNumber()
  @IsOptional()
  totalContributions?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  agency?: string;

  @ApiPropertyOptional({ enum: ClientStatus })
  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}
