import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SujetosService } from './sujetos.service';
import { CreateSujetoDto } from './dto/create-sujeto.dto';
import { QueryCuitDto } from './dto/query-cuit.dto';

@ApiTags('sujetos')
@Controller('api/sujetos')
export class SujetosController {
  constructor(private readonly sujetosService: SujetosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo sujeto (dueño)' })
  @ApiResponse({ status: 201, description: 'Sujeto creado exitosamente' })
  @ApiResponse({ status: 422, description: 'Error de validación' })
  async create(@Body() createSujetoDto: CreateSujetoDto) {
    return await this.sujetosService.create(createSujetoDto);
  }

  @Get('by-cuit')
  @ApiOperation({ summary: 'Buscar sujeto por CUIT' })
  @ApiQuery({
    name: 'cuit',
    description: 'CUIT del sujeto (11 dígitos)',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Sujeto encontrado' })
  @ApiResponse({ status: 404, description: 'Sujeto no encontrado' })
  async findByCuit(@Query() query: QueryCuitDto) {
    return await this.sujetosService.findByCuit(query.cuit);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los sujetos' })
  @ApiResponse({ status: 200, description: 'Lista de sujetos' })
  async findAll() {
    return await this.sujetosService.findAll();
  }
}
