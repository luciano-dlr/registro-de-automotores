import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { vehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { ObjectValue } from '../object-value/entities/object-value.entity';
import { Subject } from '../subject/entities/subject.entity';
import { Ownership } from '../ownership/entities/ownership.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, ObjectValue, Subject, Ownership]),
  ],
  controllers: [vehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule { }
