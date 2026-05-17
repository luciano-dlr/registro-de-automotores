import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Automotor } from './entities/automotor.entity';
import { ObjetoDeValor } from '../objeto-valor/entities/objeto-valor.entity';
import { Sujeto } from '../sujetos/entities/sujeto.entity';
import { Vinculo } from '../vinculo/entities/vinculo.entity';
import { CreateAutomotorDto } from './dto/create-automotor.dto';
import { UpdateAutomotorDto } from './dto/update-automotor.dto';

export interface AutomotorResponse {
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

export interface AutomotorListItem {
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
export class AutomotoresService {
  constructor(
    @InjectRepository(Automotor)
    private automotorRepository: Repository<Automotor>,
    @InjectRepository(ObjetoDeValor)
    private objetoDeValorRepository: Repository<ObjetoDeValor>,
    @InjectRepository(Sujeto)
    private sujetoRepository: Repository<Sujeto>,
    @InjectRepository(Vinculo)
    private vinculoRepository: Repository<Vinculo>,
  ) { }

  async findAll(): Promise<AutomotorListItem[]> {
    const automotoress = await this.automotorRepository.find({
      relations: ['objetoValor'],
    });

    const resultado = await Promise.all(
      automotoress.map(async (automotor) => {
        const vinculoActivo = await this.vinculoRepository
          .createQueryBuilder('v')
          .leftJoinAndSelect('v.sujeto', 'sujeto')
          .where('v.vso_ovp_id = :ovpId', { ovpId: automotor.atr_ovp_id })
          .andWhere('v.vso_responsable = :responsable', { responsable: 'S' })
          .andWhere('v.vso_fecha_fin IS NULL')
          .getOne();

        return {
          dominio: automotor.atr_dominio,
          numeroChasis: automotor.atr_numero_chasis,
          numeroMotor: automotor.atr_numero_motor,
          color: automotor.atr_color,
          fechaFabricacion: automotor.atr_fecha_fabricacion,
          fechaAltaRegistro: automotor.atr_fecha_alta_registro,
          cuitDueno: vinculoActivo?.sujeto?.spo_cuit || null,
          denominacionDueno: vinculoActivo?.sujeto?.spo_denominacion || null,
        };
      }),
    );

    return resultado;
  }

  async findByDominio(dominio: string): Promise<AutomotorResponse> {
    const automotor = await this.automotorRepository.findOne({
      where: { atr_dominio: dominio },
      relations: ['objetoValor'],
    });

    if (!automotor) {
      throw new NotFoundException(
        `Automotor con dominio ${dominio} no encontrado`,
      );
    }

    const vinculoActivo = await this.vinculoRepository
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.sujeto', 'sujeto')
      .where('v.vso_ovp_id = :ovpId', { ovpId: automotor.atr_ovp_id })
      .andWhere('v.vso_responsable = :responsable', { responsable: 'S' })
      .andWhere('v.vso_fecha_fin IS NULL')
      .getOne();

    return {
      dominio: automotor.atr_dominio,
      numeroChasis: automotor.atr_numero_chasis,
      numeroMotor: automotor.atr_numero_motor,
      color: automotor.atr_color,
      fechaFabricacion: automotor.atr_fecha_fabricacion,
      fechaAltaRegistro: automotor.atr_fecha_alta_registro,
      numeroObjetoValor: automotor.atr_ovp_id,
      cuitDueno: vinculoActivo?.sujeto?.spo_cuit || null,
      denominacionDueno: vinculoActivo?.sujeto?.spo_denominacion || null,
    };
  }

  async create(
    createAutomotorDto: CreateAutomotorDto,
  ): Promise<AutomotorResponse> {
    const {
      dominio,
      numeroChasis,
      numeroMotor,
      color,
      fechaFabricacion,
      cuitDueno,
    } = createAutomotorDto;

    const sujeto = await this.sujetoRepository.findOne({
      where: { spo_cuit: cuitDueno },
    });

    if (!sujeto) {
      throw new UnprocessableEntityException('CUIT no registrado');
    }

    let objetoDeValor = await this.objetoDeValorRepository.findOne({
      where: { ovp_codigo: dominio },
    });

    if (!objetoDeValor) {
      objetoDeValor = this.objetoDeValorRepository.create({
        ovp_tipo: 'AUTOMOTOR',
        ovp_codigo: dominio,
      });
      objetoDeValor = await this.objetoDeValorRepository.save(objetoDeValor);
    }

    const automotor = this.automotorRepository.create({
      atr_ovp_id: objetoDeValor.ovp_id,
      atr_dominio: dominio.toUpperCase(),
      atr_numero_chasis: numeroChasis?.toUpperCase(),
      atr_numero_motor: numeroMotor?.toUpperCase(),
      atr_color: color?.toUpperCase(),
      atr_fecha_fabricacion: fechaFabricacion,
    });
    await this.automotorRepository.save(automotor);

    const vinculosPrevios = await this.vinculoRepository.find({
      where: {
        vso_ovp_id: objetoDeValor.ovp_id,
        vso_responsable: 'S',
      },
    });

    const today = new Date();
    for (const vinculo of vinculosPrevios) {
      await this.vinculoRepository.update(vinculo.vso_id, {
        vso_fecha_fin: today,
      });
    }

    const nuevoVinculo = new Vinculo();
    nuevoVinculo.vso_ovp_id = objetoDeValor.ovp_id;
    nuevoVinculo.vso_spo_id = Number(sujeto.spo_id);
    nuevoVinculo.vso_tipo_vinculo = 'DUENO';
    nuevoVinculo.vso_porcentaje = 100;
    nuevoVinculo.vso_responsable = 'S';
    nuevoVinculo.vso_fecha_inicio = today;
    await this.vinculoRepository.save(nuevoVinculo);

    const resultado = await this.findByDominio(dominio.toUpperCase());

    if (!numeroChasis || !numeroMotor || !color) {
      resultado.nota = `Los campos numeroChasis, numeroMotor y color son opcionales. Puede actualizarlos con el dominio ${dominio.toUpperCase()}`;
    }

    return resultado;
  }

  async update(
    dominio: string,
    updateAutomotorDto: UpdateAutomotorDto,
  ): Promise<AutomotorResponse> {
    const automotor = await this.automotorRepository.findOne({
      where: { atr_dominio: dominio },
      relations: ['objetoValor'],
    });

    if (!automotor) {
      throw new NotFoundException(
        `Automotor con dominio ${dominio} no encontrado`,
      );
    }

    const { numeroChasis, numeroMotor, color, fechaFabricacion, cuitDueno } =
      updateAutomotorDto;

    const updateData: Partial<Automotor> = {};
    if (numeroChasis !== undefined)
      updateData.atr_numero_chasis = numeroChasis.toUpperCase();
    if (numeroMotor !== undefined)
      updateData.atr_numero_motor = numeroMotor.toUpperCase();
    if (color !== undefined) updateData.atr_color = color.toUpperCase();
    if (fechaFabricacion !== undefined)
      updateData.atr_fecha_fabricacion = fechaFabricacion;

    if (Object.keys(updateData).length > 0) {
      await this.automotorRepository.update(automotor.atr_id, updateData);
    }

    if (cuitDueno) {
      const nuevoSujeto = await this.sujetoRepository.findOne({
        where: { spo_cuit: cuitDueno },
      });

      if (!nuevoSujeto) {
        throw new UnprocessableEntityException('CUIT no registrado');
      }

      const vinculoActivo = await this.vinculoRepository
        .createQueryBuilder('v')
        .where('v.vso_ovp_id = :ovpId', { ovpId: automotor.atr_ovp_id })
        .andWhere('v.vso_responsable = :responsable', { responsable: 'S' })
        .andWhere('v.vso_fecha_fin IS NULL')
        .getOne();

      if (vinculoActivo) {
        const today = new Date();
        await this.vinculoRepository
          .createQueryBuilder()
          .update(Vinculo)
          .set({ vso_fecha_fin: today })
          .where('vso_id = :id', { id: vinculoActivo.vso_id })
          .execute();
      }

      const nuevoVinculo = new Vinculo();
      nuevoVinculo.vso_ovp_id = Number(automotor.atr_ovp_id);
      nuevoVinculo.vso_spo_id = Number(nuevoSujeto.spo_id);
      nuevoVinculo.vso_tipo_vinculo = 'DUENO';
      nuevoVinculo.vso_porcentaje = 100;
      nuevoVinculo.vso_responsable = 'S';
      nuevoVinculo.vso_fecha_inicio = new Date();
      await this.vinculoRepository.save(nuevoVinculo);
    }

    return await this.findByDominio(dominio);
  }

  async delete(dominio: string): Promise<void> {
    const automotor = await this.automotorRepository.findOne({
      where: { atr_dominio: dominio },
    });

    if (!automotor) {
      throw new NotFoundException(
        `Automotor con dominio ${dominio} no encontrado`,
      );
    }

    await this.automotorRepository.remove(automotor);
  }
}
