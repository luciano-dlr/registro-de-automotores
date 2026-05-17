import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { IsDomain } from '../../../common/validators/domain.validator';
import { IsCuit } from '../../../common/validators/cuit.validator';
import { IsManufacturingDate } from '../../../common/validators/date-manufacturing.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehiclesDto {
  @ApiProperty({
    example: 'ABC311',
    description: 'Dominio del automotor (formato AAA999 o AA999AA)',
  })
  @IsDomain()
  @IsString()
  @IsNotEmpty({ message: 'El dominio es obligatorio' })
  @MaxLength(8)
  dominio: string;

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
    example: 202605,
    description:
      'Fecha de fabricación (formato YYYYMM, debe ser presente o pasado)',
  })
  @IsManufacturingDate({
    message:
      'La fecha de fabricación debe tener formato YYYYMM (6 dígitos), mes entre 01 y 12, y no puede ser futura',
  })
  @IsNumber({}, { message: 'La fecha de fabricación debe ser un número' })
  @Min(190001, { message: 'La fecha de fabricación debe ser mayor a 190000' })
  fechaFabricacion: number;

  @ApiProperty({
    example: '27405191038',
    description: 'CUIT del dueño (debe estar previamente registrado)',
  })
  @IsCuit()
  @IsString()
  @IsNotEmpty({ message: 'El CUIT del dueño es obligatorio' })
  cuitDueno: string;
}
