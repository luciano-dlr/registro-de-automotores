import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { ObjectValue } from '../object-value/entities/object-value.entity';
import { Subject } from '../subject/entities/subject.entity';
import { Ownership } from '../ownership/entities/ownership.entity';
import { CreateVehiclesDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

export interface VehicleResponse {
  dominio: string;
  numeroChasis: string | null;
  numeroMotor: string | null;
  color: string | null;
  fechaFabricacion: number;
  fechaAltaRegistro: Date;
  numeroObjetoValor: number;
  cuitDueno: string | null;
  denominacionDueno: string | null;
  nota?: string;
}

export interface VehicleListItem {
  dominio: string;
  numeroChasis: string | null;
  numeroMotor: string | null;
  color: string | null;
  fechaFabricacion: number;
  fechaAltaRegistro: Date;
  cuitDueno: string | null;
  denominacionDueno: string | null;
}

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(ObjectValue)
    private objectValueRepository: Repository<ObjectValue>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Ownership)
    private ownershipRepository: Repository<Ownership>,
  ) { }

  async findAll(): Promise<VehicleListItem[]> {
    const vehicles = await this.vehicleRepository.find({
      relations: ['objetoValor'],
    });

    const result = await Promise.all(
      vehicles.map(async (vehicle) => {
        const activeOwnership = await this.ownershipRepository
          .createQueryBuilder('v')
          .leftJoinAndSelect('v.sujeto', 'sujeto')
          .where('v.vso_ovp_id = :ovpId', { ovpId: vehicle.atr_ovp_id })
          .andWhere('v.vso_responsable = :responsable', { responsable: 'S' })
          .andWhere('v.vso_fecha_fin IS NULL')
          .getOne();

        return {
          dominio: vehicle.atr_dominio,
          numeroChasis: vehicle.atr_numero_chasis,
          numeroMotor: vehicle.atr_numero_motor,
          color: vehicle.atr_color,
          fechaFabricacion: vehicle.atr_fecha_fabricacion,
          fechaAltaRegistro: vehicle.atr_fecha_alta_registro,
          cuitDueno: activeOwnership?.sujeto?.spo_cuit || null,
          denominacionDueno: activeOwnership?.sujeto?.spo_denominacion || null,
        };
      }),
    );

    return result;
  }

  async findByDominio(dominio: string): Promise<VehicleResponse> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { atr_dominio: dominio },
      relations: ['objetoValor'],
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Automotor con dominio ${dominio} no encontrado`,
      );
    }

    const activeOwnership = await this.ownershipRepository
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.sujeto', 'sujeto')
      .where('v.vso_ovp_id = :ovpId', { ovpId: vehicle.atr_ovp_id })
      .andWhere('v.vso_responsable = :responsable', { responsable: 'S' })
      .andWhere('v.vso_fecha_fin IS NULL')
      .getOne();

    return {
      dominio: vehicle.atr_dominio,
      numeroChasis: vehicle.atr_numero_chasis,
      numeroMotor: vehicle.atr_numero_motor,
      color: vehicle.atr_color,
      fechaFabricacion: vehicle.atr_fecha_fabricacion,
      fechaAltaRegistro: vehicle.atr_fecha_alta_registro,
      numeroObjetoValor: vehicle.atr_ovp_id,
      cuitDueno: activeOwnership?.sujeto?.spo_cuit || null,
      denominacionDueno: activeOwnership?.sujeto?.spo_denominacion || null,
    };
  }

  async create(
    CreateVehiclesDto: CreateVehiclesDto,
  ): Promise<VehicleResponse> {
    const {
      dominio,
      numeroChasis,
      numeroMotor,
      color,
      fechaFabricacion,
      cuitDueno,
    } = CreateVehiclesDto;

    const sujeto = await this.subjectRepository.findOne({
      where: { spo_cuit: cuitDueno },
    });

    if (!sujeto) {
      throw new UnprocessableEntityException('CUIT no registrado');
    }

    let objectValue = await this.objectValueRepository.findOne({
      where: { ovp_codigo: dominio },
    });

    if (!objectValue) {
      objectValue = this.objectValueRepository.create({
        ovp_tipo: 'AUTOMOTOR',
        ovp_codigo: dominio,
      });
      objectValue = await this.objectValueRepository.save(objectValue);
    }

    const vehicle = this.vehicleRepository.create({
      atr_ovp_id: objectValue.ovp_id,
      atr_dominio: dominio.toUpperCase(),
      atr_numero_chasis: numeroChasis?.toUpperCase(),
      atr_numero_motor: numeroMotor?.toUpperCase(),
      atr_color: color?.toUpperCase(),
      atr_fecha_fabricacion: fechaFabricacion,
    });
    await this.vehicleRepository.save(vehicle);

    const previousOwnerships = await this.ownershipRepository.find({
      where: {
        vso_ovp_id: objectValue.ovp_id,
        vso_responsable: 'S',
      },
    });

    const today = new Date();
    for (const ownership of previousOwnerships) {
      await this.ownershipRepository.update(ownership.vso_id, {
        vso_fecha_fin: today,
      });
    }

    const newOwnership = new Ownership();
    newOwnership.vso_ovp_id = objectValue.ovp_id;
    newOwnership.vso_spo_id = Number(sujeto.spo_id);
    newOwnership.vso_tipo_vinculo = 'DUENO';
    newOwnership.vso_porcentaje = 100;
    newOwnership.vso_responsable = 'S';
    newOwnership.vso_fecha_inicio = today;
    await this.ownershipRepository.save(newOwnership);

    const result = await this.findByDominio(dominio.toUpperCase());

    if (!numeroChasis || !numeroMotor || !color) {
      result.nota = `Los campos numeroChasis, numeroMotor y color son opcionales. Puede actualizarlos con el dominio ${dominio.toUpperCase()}`;
    }

    return result;
  }

  async update(
    dominio: string,
    UpdateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleResponse> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { atr_dominio: dominio },
      relations: ['objetoValor'],
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Automotor con dominio ${dominio} no encontrado`,
      );
    }

    const { numeroChasis, numeroMotor, color, fechaFabricacion, cuitDueno } =
      UpdateVehicleDto;

    const updateData: Partial<Vehicle> = {};
    if (numeroChasis !== undefined)
      updateData.atr_numero_chasis = numeroChasis.toUpperCase();
    if (numeroMotor !== undefined)
      updateData.atr_numero_motor = numeroMotor.toUpperCase();
    if (color !== undefined) updateData.atr_color = color.toUpperCase();
    if (fechaFabricacion !== undefined)
      updateData.atr_fecha_fabricacion = fechaFabricacion;

    if (Object.keys(updateData).length > 0) {
      await this.vehicleRepository.update(vehicle.atr_id, updateData);
    }

    if (cuitDueno) {
      const newSubject = await this.subjectRepository.findOne({
        where: { spo_cuit: cuitDueno },
      });

      if (!newSubject) {
        throw new UnprocessableEntityException('CUIT no registrado');
      }

      const activeOwnership = await this.ownershipRepository
        .createQueryBuilder('v')
        .where('v.vso_ovp_id = :ovpId', { ovpId: vehicle.atr_ovp_id })
        .andWhere('v.vso_responsable = :responsable', { responsable: 'S' })
        .andWhere('v.vso_fecha_fin IS NULL')
        .getOne();

      if (activeOwnership) {
        const today = new Date();
        await this.ownershipRepository
          .createQueryBuilder()
          .update(Ownership)
          .set({ vso_fecha_fin: today })
          .where('vso_id = :id', { id: activeOwnership.vso_id })
          .execute();
      }

      const newOwnership = new Ownership();
      newOwnership.vso_ovp_id = Number(vehicle.atr_ovp_id);
      newOwnership.vso_spo_id = Number(newSubject.spo_id);
      newOwnership.vso_tipo_vinculo = 'DUENO';
      newOwnership.vso_porcentaje = 100;
      newOwnership.vso_responsable = 'S';
      newOwnership.vso_fecha_inicio = new Date();
      await this.ownershipRepository.save(newOwnership);
    }

    return await this.findByDominio(dominio);
  }

  async delete(dominio: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { atr_dominio: dominio },
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Automotor con dominio ${dominio} no encontrado`,
      );
    }

    await this.vehicleRepository.remove(vehicle);
  }
}
