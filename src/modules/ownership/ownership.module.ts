import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnershipService } from './ownership.service';
import { Ownership } from './entities/ownership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ownership])],
  providers: [OwnershipService],
  exports: [OwnershipService],
})
export class OwnershipModule { }
