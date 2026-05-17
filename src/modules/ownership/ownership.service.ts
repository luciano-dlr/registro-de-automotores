import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ownership } from './entities/ownership.entity';

@Injectable()
export class OwnershipService {
  constructor(
    @InjectRepository(Ownership)
    private ownershipRepository: Repository<Ownership>,
  ) {}

  async findByObjetoAndActivo(ovpId: number): Promise<Ownership | null> {
    return await this.ownershipRepository
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.sujeto', 'sujeto')
      .where('v.vso_ovp_id = :ovpId', { ovpId })
      .andWhere('v.vso_responsable = :responsable', { responsable: 'S' })
      .andWhere('v.vso_fecha_fin IS NULL')
      .getOne();
  }

  async findActivosByObjeto(ovpId: number): Promise<Ownership[]> {
    return await this.ownershipRepository.find({
      where: {
        vso_ovp_id: ovpId,
        vso_responsable: 'S',
      },
      relations: ['sujeto'],
    });
  }

  async create(OwnershipData: Partial<Ownership>): Promise<Ownership> {
    const Ownership = this.ownershipRepository.create(OwnershipData);
    return await this.ownershipRepository.save(Ownership);
  }

  async closeVinculo(vsoId: number, fechaFin: Date): Promise<void> {
    await this.ownershipRepository.update(vsoId, {
      vso_fecha_fin: fechaFin,
    });
  }

  async findBySujetoAndActivo(spoId: number): Promise<Ownership[]> {
    return await this.ownershipRepository.find({
      where: {
        vso_spo_id: spoId,
        vso_responsable: 'S',
      },
    });
  }
}
