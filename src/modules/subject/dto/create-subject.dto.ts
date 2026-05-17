import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { IsCuit } from '../../../common/validators/cuit.validator';

export class CreateSubjectDto {
  @IsCuit()
  @IsString()
  @IsNotEmpty({ message: 'El CUIT es obligatorio' })
  spo_cuit: string;

  @IsString()
  @IsNotEmpty({ message: 'La denominación es obligatoria' })
  @MaxLength(160, {
    message: 'La denominación no puede exceder 160 caracteres',
  })
  spo_denominacion: string;
}
