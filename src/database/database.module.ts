import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sujeto } from '../modules/sujetos/entities/sujeto.entity';
import { ObjetoDeValor } from '../modules/objeto-valor/entities/objeto-valor.entity';
import { Automotor } from '../modules/automotores/entities/automotor.entity';
import { Vinculo } from '../modules/vinculo/entities/vinculo.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USER') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || 'postgres',
        database: configService.get<string>('DB_NAME') || 'automotores_db',
        synchronize: true,
        logging: configService.get<string>('NODE_ENV') === 'development',
        entities: [Sujeto, ObjetoDeValor, Automotor, Vinculo],
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
