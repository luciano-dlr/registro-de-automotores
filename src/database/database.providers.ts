import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Sujeto } from '../modules/sujetos/entities/sujeto.entity';
import { ObjetoDeValor } from '../modules/objeto-valor/entities/objeto-valor.entity';
import { Automotor } from '../modules/automotores/entities/automotor.entity';
import { Vinculo } from '../modules/vinculo/entities/vinculo.entity';

export const DATA_SOURCE = 'DATA_SOURCE';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'automotores_db'),
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
        entities: [Sujeto, ObjetoDeValor, Automotor, Vinculo],
        extra: {
          connectionTimeoutMillis: 10000,
        },
      });
      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
];
