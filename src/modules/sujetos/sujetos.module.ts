import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SujetosController } from './sujetos.controller';
import { SujetosService } from './sujetos.service';
import { Sujeto } from './entities/sujeto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sujeto])],
  controllers: [SujetosController],
  providers: [SujetosService],
  exports: [SujetosService],
})
export class SujetosModule {}
