import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomotoresController } from './automotores.controller';
import { AutomotoresService } from './automotores.service';
import { Automotor } from './entities/automotor.entity';
import { ObjetoDeValor } from '../objeto-valor/entities/objeto-valor.entity';
import { Sujeto } from '../sujetos/entities/sujeto.entity';
import { Vinculo } from '../vinculo/entities/vinculo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Automotor, ObjetoDeValor, Sujeto, Vinculo]),
  ],
  controllers: [AutomotoresController],
  providers: [AutomotoresService],
  exports: [AutomotoresService],
})
export class AutomotoresModule {}
