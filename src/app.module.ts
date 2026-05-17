import { INestApplication, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SujetosModule } from './modules/sujetos/sujetos.module';
import { AutomotoresModule } from './modules/automotores/automotores.module';
import { VinculoModule } from './modules/vinculo/vinculo.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    SujetosModule,
    AutomotoresModule,
    VinculoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {
  static setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('API de Registro de Automotores')
      .setDescription(
        'Challenge técnico Mindfactory - NestJS + TypeORM + PostgreSQL',
      )
      .setVersion('1.0')
      .addTag('sujetos', 'Operaciones sobre sujetos (dueños)')
      .addTag('automotores', 'Operaciones sobre automotores')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
}
