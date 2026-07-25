import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ description: 'ID del cliente propietario de la cuenta' })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;
}
