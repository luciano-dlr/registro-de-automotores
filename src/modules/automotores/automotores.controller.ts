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
import { AutomotoresService } from './automotores.service';
import { CreateAutomotorDto } from './dto/create-automotor.dto';
import { UpdateAutomotorDto } from './dto/update-automotor.dto';

@Controller('api/automotores')
export class AutomotoresController {
  constructor(private readonly automotoresService: AutomotoresService) {}

  @Get()
  async findAll() {
    return await this.automotoresService.findAll();
  }

  @Get(':dominio')
  async findByDominio(@Param('dominio') dominio: string) {
    return await this.automotoresService.findByDominio(dominio.toUpperCase());
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAutomotorDto: CreateAutomotorDto) {
    return await this.automotoresService.create(createAutomotorDto);
  }

  @Put(':dominio')
  async update(
    @Param('dominio') dominio: string,
    @Body() updateAutomotorDto: UpdateAutomotorDto,
  ) {
    return await this.automotoresService.update(
      dominio.toUpperCase(),
      updateAutomotorDto,
    );
  }

  @Delete(':dominio')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('dominio') dominio: string) {
    return await this.automotoresService.delete(dominio.toUpperCase());
  }
}
