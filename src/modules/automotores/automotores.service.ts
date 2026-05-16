import {
  Injectable,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Automotor } from './entities/automotor.entity';
import { ObjetoDeValor } from '../objeto-valor/entities/objeto-valor.entity';
import { Sujeto } from '../sujetos/entities/sujeto.entity';
import { Vinculo } from '../vinculo/entities/vinculo.entity';
import { CreateAutomotorDto } from './dto/create-automotor.dto';
import { UpdateAutomotorDto } from './dto/update-automotor.dto';

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
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<any[]> {
    const automotoress = await this.automotorRepository.find({
      relations: ['objetoValor'],
    });

    // Para cada automotor, buscar el vínculo activo
    const resultado = await Promise.all(
      automotoress.map(async (automotor) => {
        const vinculoActivo = await this.vinculoRepository.findOne({
          where: {
            vso_ovp_id: automotor.atr_ovp_id,
            vso_responsable: 'S',
            vso_fecha_fin: undefined as any,
          },
          relations: ['sujeto'],
        });

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

  async findByDominio(dominio: string): Promise<any> {
    const automotor = await this.automotorRepository.findOne({
      where: { atr_dominio: dominio },
      relations: ['objetoValor'],
    });

    if (!automotor) {
      throw new NotFoundException(
        `Automotor con dominio ${dominio} no encontrado`,
      );
    }

    const vinculoActivo = await this.vinculoRepository.findOne({
      where: {
        vso_ovp_id: automotor.atr_ovp_id,
        vso_responsable: 'S',
      },
      relations: ['sujeto'],
    });

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

  async create(createAutomotorDto: CreateAutomotorDto): Promise<any> {
    const {
      dominio,
      numeroChasis,
      numeroMotor,
      color,
      fechaFabricacion,
      cuitDueno,
    } = createAutomotorDto;

    // Validar que el CUIT del dueño exista
    const sujeto = await this.sujetoRepository.findOne({
      where: { spo_cuit: cuitDueno },
    });

    if (!sujeto) {
      throw new UnprocessableEntityException('CUIT no registrado');
    }

    // Buscar o crear Objeto_De_Valor con ese dominio
    let objetoDeValor = await this.objetoDeValorRepository.findOne({
      where: { ovp_codigo: dominio },
    });

    if (!objetoDeValor) {
      // Crear nuevo Objeto_De_Valor
      objetoDeValor = this.objetoDeValorRepository.create({
        ovp_tipo: 'AUTOMOTOR',
        ovp_codigo: dominio,
      });
      objetoDeValor = await this.objetoDeValorRepository.save(objetoDeValor);
    }

    // Crear el Automotor
    const automotor = this.automotorRepository.create({
      atr_ovp_id: objetoDeValor.ovp_id,
      atr_dominio: dominio.toUpperCase(),
      atr_numero_chasis: numeroChasis?.toUpperCase(),
      atr_numero_motor: numeroMotor?.toUpperCase(),
      atr_color: color?.toUpperCase(),
      atr_fecha_fabricacion: fechaFabricacion,
    });
    await this.automotorRepository.save(automotor);

    // Cerrar cualquier vínculo activo previo para este objeto
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

    // Crear nuevo vínculo con el dueño
    const nuevoVinculo = new Vinculo();
    nuevoVinculo.vso_ovp_id = objetoDeValor.ovp_id;
    nuevoVinculo.vso_spo_id = Number(sujeto.spo_id);
    nuevoVinculo.vso_tipo_vinculo = 'DUENO';
    nuevoVinculo.vso_porcentaje = 100;
    nuevoVinculo.vso_responsable = 'S';
    nuevoVinculo.vso_fecha_inicio = today;
    nuevoVinculo.vso_fecha_fin = undefined as any;
    await this.vinculoRepository.save(nuevoVinculo);

    return await this.findByDominio(dominio.toUpperCase());
  }

  async update(
    dominio: string,
    updateAutomotorDto: UpdateAutomotorDto,
  ): Promise<any> {
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

    // Actualizar datos del automotor
    const updateData: Partial<Automotor> = {};
    if (numeroChasis !== undefined)
      updateData.atr_numero_chasis = numeroChasis.toUpperCase();
    if (numeroMotor !== undefined)
      updateData.atr_numero_motor = numeroMotor.toUpperCase();
    if (color !== undefined) updateData.atr_color = color.toUpperCase();
    if (fechaFabricacion !== undefined)
      updateData.atr_fecha_fabricacion = fechaFabricacion;

    await this.automotorRepository.update(automotor.atr_id, updateData);

    // Si se envía un nuevo CUIT, reasignar dueño
    if (cuitDueno) {
      const nuevoSujeto = await this.sujetoRepository.findOne({
        where: { spo_cuit: cuitDueno },
      });

      if (!nuevoSujeto) {
        throw new UnprocessableEntityException('CUIT no registrado');
      }

      // Cerrar vínculo activo actual
      const vinculoActivo = await this.vinculoRepository.findOne({
        where: {
          vso_ovp_id: automotor.atr_ovp_id,
          vso_responsable: 'S',
        },
      });

      if (vinculoActivo) {
        const today = new Date();
        await this.vinculoRepository.update(vinculoActivo.vso_id, {
          vso_fecha_fin: today,
        });
      }

      // Crear nuevo vínculo
      const nuevoVinculo = new Vinculo();
      nuevoVinculo.vso_ovp_id = Number(automotor.atr_ovp_id);
      nuevoVinculo.vso_spo_id = Number(nuevoSujeto.spo_id);
      nuevoVinculo.vso_tipo_vinculo = 'DUENO';
      nuevoVinculo.vso_porcentaje = 100;
      nuevoVinculo.vso_responsable = 'S';
      nuevoVinculo.vso_fecha_inicio = new Date();
      nuevoVinculo.vso_fecha_fin = undefined as any;
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

    // Eliminar automotor (cascadeará a Objeto_De_Valor y Vinculos)
    await this.automotorRepository.remove(automotor);
  }
}
