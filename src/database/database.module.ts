import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../modules/subject/entities/subject.entity';
import { ObjectValue } from '../modules/object-value/entities/object-value.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Ownership } from '../modules/ownership/entities/ownership.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') === 'development',
        entities: [Subject, ObjectValue, Vehicle, Ownership],
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }
