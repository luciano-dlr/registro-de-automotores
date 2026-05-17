import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
  ) { }

  async create(CreateSubjectDto: CreateSubjectDto): Promise<Subject> {
    const subject = this.subjectRepository.create(CreateSubjectDto);
    return await this.subjectRepository.save(subject);
  }

  async findAll(): Promise<Subject[]> {
    return await this.subjectRepository.find();
  }

  async findByCuit(cuit: string): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { spo_cuit: cuit },
    });

    if (!subject) {
      throw new NotFoundException(`Sujeto con CUIT ${cuit} no encontrado`);
    }

    return subject;
  }

  async findById(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { spo_id: id },
    });

    if (!subject) {
      throw new NotFoundException(`Sujeto con ID ${id} no encontrado`);
    }

    return subject;
  }
}
