import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vinculo } from './entities/vinculo.entity';

@Injectable()
export class VinculoService {
  constructor(
    @InjectRepository(Vinculo)
    private vinculoRepository: Repository<Vinculo>,
  ) {}

  async findByObjetoAndActivo(ovpId: number): Promise<Vinculo | null> {
    return await this.vinculoRepository.findOne({
      where: {
        vso_ovp_id: ovpId,
        vso_responsable: 'S',
        vso_fecha_fin: undefined as any, // No se puede usar null directamente en TypeORM
      },
      relations: ['sujeto'],
    });
  }

  async findActivosByObjeto(ovpId: number): Promise<Vinculo[]> {
    return await this.vinculoRepository.find({
      where: {
        vso_ovp_id: ovpId,
        vso_responsable: 'S',
      },
      relations: ['sujeto'],
    });
  }

  async create(vinculoData: Partial<Vinculo>): Promise<Vinculo> {
    const vinculo = this.vinculoRepository.create(vinculoData);
    return await this.vinculoRepository.save(vinculo);
  }

  async closeVinculo(vsoId: number, fechaFin: Date): Promise<void> {
    await this.vinculoRepository.update(vsoId, {
      vso_fecha_fin: fechaFin,
    });
  }

  async findBySujetoAndActivo(spoId: number): Promise<Vinculo[]> {
    return await this.vinculoRepository.find({
      where: {
        vso_spo_id: spoId,
        vso_responsable: 'S',
      },
    });
  }
}
