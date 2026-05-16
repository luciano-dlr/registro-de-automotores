import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VinculoService } from './vinculo.service';
import { Vinculo } from './entities/vinculo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vinculo])],
  providers: [VinculoService],
  exports: [VinculoService],
})
export class VinculoModule {}
