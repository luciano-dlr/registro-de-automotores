import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private sujetoRepository: Repository<Subject>,
  ) { }

  async create(createSujetoDto: CreateSubjectDto): Promise<Subject> {
    const sujeto = this.sujetoRepository.create(createSujetoDto);
    return await this.sujetoRepository.save(sujeto);
  }

  async findAll(): Promise<Subject[]> {
    return await this.sujetoRepository.find();
  }

  async findByCuit(cuit: string): Promise<Subject> {
    const sujeto = await this.sujetoRepository.findOne({
      where: { spo_cuit: cuit },
    });

    if (!sujeto) {
      throw new NotFoundException(`Sujeto con CUIT ${cuit} no encontrado`);
    }

    return sujeto;
  }

  async findById(id: number): Promise<Subject> {
    const sujeto = await this.sujetoRepository.findOne({
      where: { spo_id: id },
    });

    if (!sujeto) {
      throw new NotFoundException(`Sujeto con ID ${id} no encontrado`);
    }

    return sujeto;
  }
}
