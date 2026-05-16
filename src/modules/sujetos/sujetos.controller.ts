import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SujetosService } from './sujetos.service';
import { CreateSujetoDto } from './dto/create-sujeto.dto';
import { QueryCuitDto } from './dto/query-cuit.dto';

@Controller('api/sujetos')
export class SujetosController {
  constructor(private readonly sujetosService: SujetosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSujetoDto: CreateSujetoDto) {
    return await this.sujetosService.create(createSujetoDto);
  }

  @Get('by-cuit')
  async findByCuit(@Query() query: QueryCuitDto) {
    return await this.sujetosService.findByCuit(query.cuit);
  }

  @Get()
  async findAll() {
    return await this.sujetosService.findAll();
  }
}
