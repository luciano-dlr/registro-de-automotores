import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { IsCuit } from '../../../common/validators/cuit.validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({
    example: '20401093495',
    description: 'CUIT del sujeto (11 dígitos, formato válido)',
  })
  @IsCuit()
  @IsString()
  @IsNotEmpty({ message: 'El CUIT es obligatorio' })
  spo_cuit: string;

  @ApiProperty({
    example: 'Luciano Gómez',
    description: 'Denominación o nombre del sujeto',
  })
  @IsString()
  @IsNotEmpty({ message: 'La denominación es obligatoria' })
  @MaxLength(160, {
    message: 'La denominación no puede exceder 160 caracteres',
  })
  spo_denominacion: string;
}
