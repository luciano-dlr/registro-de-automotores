import {
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { IsCuit } from '../../../common/validators/cuit.validator';
import { IsFechaFabricacion } from '../../../common/validators/fecha-fabricacion.validator';

export class UpdateAutomotorDto {
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

  @IsOptional()
  @IsFechaFabricacion()
  @IsNumber({}, { message: 'La fecha de fabricación debe ser un número' })
  @Min(190001, { message: 'La fecha de fabricación debe ser mayor a 190000' })
  fechaFabricacion?: number;

  @IsOptional()
  @IsCuit()
  @IsString()
  cuitDueno?: string;
}
