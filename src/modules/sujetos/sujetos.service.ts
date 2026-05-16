import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sujeto } from './entities/sujeto.entity';
import { CreateSujetoDto } from './dto/create-sujeto.dto';

@Injectable()
export class SujetosService {
  constructor(
    @InjectRepository(Sujeto)
    private sujetoRepository: Repository<Sujeto>,
  ) {}

  async create(createSujetoDto: CreateSujetoDto): Promise<Sujeto> {
    const sujeto = this.sujetoRepository.create(createSujetoDto);
    return await this.sujetoRepository.save(sujeto);
  }

  async findAll(): Promise<Sujeto[]> {
    return await this.sujetoRepository.find();
  }

  async findByCuit(cuit: string): Promise<Sujeto> {
    const sujeto = await this.sujetoRepository.findOne({
      where: { spo_cuit: cuit },
    });

    if (!sujeto) {
      throw new NotFoundException(`Sujeto con CUIT ${cuit} no encontrado`);
    }

    return sujeto;
  }

  async findById(id: number): Promise<Sujeto> {
    const sujeto = await this.sujetoRepository.findOne({
      where: { spo_id: id },
    });

    if (!sujeto) {
      throw new NotFoundException(`Sujeto con ID ${id} no encontrado`);
    }

    return sujeto;
  }
}
