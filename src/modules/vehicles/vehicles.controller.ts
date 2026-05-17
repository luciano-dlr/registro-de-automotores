import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehiclesDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@ApiTags('automotores')
@Controller('api/automotores')
export class vehiclesController {
  constructor(private readonly automotoresService: VehiclesService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todos los automotores con su dueño actual' })
  @ApiResponse({ status: 200, description: 'Lista de automotores' })
  async findAll() {
    return await this.automotoresService.findAll();
  }

  @Get(':dominio')
  @ApiOperation({ summary: 'Ver detalle de un automotor por dominio' })
  @ApiParam({
    name: 'dominio',
    description: 'Dominio del automotor (ej: ABC123)',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Automotor encontrado' })
  @ApiResponse({ status: 404, description: 'Automotor no encontrado' })
  async findByDominio(@Param('dominio') dominio: string) {
    return await this.automotoresService.findByDominio(dominio.toUpperCase());
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un automotor y asignar dueño' })
  @ApiResponse({ status: 201, description: 'Automotor creado exitosamente' })
  @ApiResponse({
    status: 422,
    description: 'Error de validación o CUIT no registrado',
  })
  async create(@Body() createAutomotorDto: CreateVehiclesDto) {
    return await this.automotoresService.create(createAutomotorDto);
  }

  @Put(':dominio')
  @ApiOperation({
    summary: 'Actualizar datos del automotor y/o reasignar dueño',
  })
  @ApiParam({
    name: 'dominio',
    description: 'Dominio del automotor',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Automotor actualizado' })
  @ApiResponse({ status: 404, description: 'Automotor no encontrado' })
  async update(
    @Param('dominio') dominio: string,
    @Body() updateAutomotorDto: UpdateVehicleDto,
  ) {
    return await this.automotoresService.update(
      dominio.toUpperCase(),
      updateAutomotorDto,
    );
  }

  @Delete(':dominio')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un automotor en cascada' })
  @ApiParam({
    name: 'dominio',
    description: 'Dominio del automotor',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Automotor eliminado' })
  @ApiResponse({ status: 404, description: 'Automotor no encontrado' })
  async delete(@Param('dominio') dominio: string) {
    return await this.automotoresService.delete(dominio.toUpperCase());
  }
}
