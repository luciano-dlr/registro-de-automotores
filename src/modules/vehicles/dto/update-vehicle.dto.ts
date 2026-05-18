import {
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { IsCuit } from '../../../common/validators/cuit.validator';
import { IsManufacturingDate } from '../../../common/validators/date-manufacturing.validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVehicleDto {
  @ApiProperty({
    example: 'ABC123456789',
    description: 'Número de chasis (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(25, {
    message: 'El número de chasis no puede exceder 25 caracteres',
  })
  numeroChasis?: string;

  @ApiProperty({
    example: 'M123456789',
    description: 'Número de motor (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(25, {
    message: 'El número de motor no puede exceder 25 caracteres',
  })
  numeroMotor?: string;

  @ApiProperty({
    example: 'Rojo',
    description: 'Color del vehículo (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(40, { message: 'El color no puede exceder 40 caracteres' })
  color?: string;

  @ApiProperty({
    example: 202301,
    description: 'Fecha de fabricación (opcional)',
    required: false,
  })
  @IsOptional()
  @IsManufacturingDate()
  @IsNumber({}, { message: 'La fecha de fabricación debe ser un número' })
  @Min(190001, { message: 'La fecha de fabricación debe ser mayor a 190000' })
  fechaFabricacion?: number;

  @ApiProperty({
    example: '20401093495',
    description: 'CUIT del nuevo dueño (opcional, para reasignar)',
    required: false,
  })
  @IsOptional()
  @IsCuit()
  @IsString()
  cuitDueno?: string;
}
