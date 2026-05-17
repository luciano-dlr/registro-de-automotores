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

export class CreateVehiclesDto {
  @IsDomain()
  @IsString()
  @IsNotEmpty({ message: 'El dominio es obligatorio' })
  @MaxLength(8)
  dominio: string;

  @IsOptional()
  @IsString()
  @MaxLength(25, {
    message: 'El número de chasis no puede exceder 25 caracteres',
  })
  numeroChasis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(25, {
    message: 'El número de motor no puede exceder 25 caracteres',
  })
  numeroMotor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40, { message: 'El color no puede exceder 40 caracteres' })
  color?: string;

  @IsManufacturingDate({
    message:
      'La fecha de fabricación debe tener formato YYYYMM (6 dígitos), mes entre 01 y 12, y no puede ser futura',
  })
  @IsNumber({}, { message: 'La fecha de fabricación debe ser un número' })
  @Min(190001, { message: 'La fecha de fabricación debe ser mayor a 190000' })
  fechaFabricacion: number;

  @IsCuit()
  @IsString()
  @IsNotEmpty({ message: 'El CUIT del dueño es obligatorio' })
  cuitDueno: string;
}
