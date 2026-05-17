import { INestApplication, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SubjectsModule } from './modules/subject/subjects.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { OwnershipModule } from './modules/ownership/ownership.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    SubjectsModule,
    VehiclesModule,
    OwnershipModule,
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
