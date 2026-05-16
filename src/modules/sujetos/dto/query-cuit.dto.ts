import { IsString, IsNotEmpty } from 'class-validator';
import { IsCuit } from '../../../common/validators/cuit.validator';

export class QueryCuitDto {
  @IsCuit()
  @IsString()
  @IsNotEmpty({ message: 'El CUIT es obligatorio' })
  cuit: string;
}
