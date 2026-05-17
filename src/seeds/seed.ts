import { DataSource } from 'typeorm';
import { Subject } from '../modules/subject/entities/subject.entity';
import { ObjectValue } from '../modules/object-value/entities/object-value.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Ownership } from '../modules/ownership/entities/ownership.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [Subject, ObjectValue, Vehicle, Ownership],
});

const sujetosData = [
  { spo_cuit: '27123456780', spo_denominacion: 'Juan Pérez' },
  { spo_cuit: '20000000001', spo_denominacion: 'María García' },
  { spo_cuit: '27000000006', spo_denominacion: 'Carlos López' },
  { spo_cuit: '30500000123', spo_denominacion: 'Empresa Argentina SA' },
  { spo_cuit: '33600000234', spo_denominacion: 'Transportes del Norte SRL' },
];

const automovilesData = [
  {
    dominio: 'ABC123',
    numeroChasis: 'ABC123456789',
    numeroMotor: 'M123456789',
    color: 'Rojo',
    fechaFabricacion: 202301,
  },
  {
    dominio: 'AB123CD',
    numeroChasis: 'XYZ987654321',
    numeroMotor: 'M987654321',
    color: 'Azul',
    fechaFabricacion: 202205,
  },
  {
    dominio: 'XYZ999',
    numeroChasis: 'AAA111222333',
    numeroMotor: 'M111222333',
    color: 'Negro',
    fechaFabricacion: 202312,
  },
  {
    dominio: 'LM456NP',
    numeroChasis: 'BBB444555666',
    numeroMotor: 'M444555666',
    color: 'Blanco',
    fechaFabricacion: 202108,
  },
];

async function seed() {
  console.log('Iniciando seed...');

  await dataSource.initialize();
  console.log(' Conexión a DB establecida');

  const sujetoRepo = dataSource.getRepository(Subject);
  const objetoRepo = dataSource.getRepository(ObjectValue);
  const automotorRepo = dataSource.getRepository(Vehicle);
  const vinculoRepo = dataSource.getRepository(Ownership);

  const countSujetos = await sujetoRepo.count();
  if (countSujetos > 0) {
    console.log(
      'Ya existen datos en la DB. Ejecutar manualmente si se desea re-seedear.',
    );
    await dataSource.destroy();
    return;
  }

  console.log('Insertando sujetos...');
  const sujetos = await sujetoRepo.save(sujetosData);
  console.log(`${sujetos.length} sujetos insertados`);

  console.log('Insertando automotores...');
  for (const auto of automovilesData) {
    const objeto = await objetoRepo.save({
      ovp_tipo: 'AUTOMOTOR',
      ovp_codigo: auto.dominio,
      ovp_descripcion: `Automotor ${auto.dominio}`,
    });

    await automotorRepo.save({
      atr_ovp_id: objeto.ovp_id,
      atr_dominio: auto.dominio,
      atr_numero_chasis: auto.numeroChasis,
      atr_numero_motor: auto.numeroMotor,
      atr_color: auto.color,
      atr_fecha_fabricacion: auto.fechaFabricacion,
    });

    const sujetoRandom = sujetos[Math.floor(Math.random() * sujetos.length)];
    await vinculoRepo.save({
      vso_ovp_id: objeto.ovp_id,
      vso_spo_id: sujetoRandom.spo_id,
      vso_tipo_vinculo: 'DUENO',
      vso_porcentaje: 100,
      vso_responsable: 'S',
      vso_fecha_inicio: new Date(),
    });

    console.log(`Automotor ${auto.dominio} creado con dueño`);
  }

  console.log('Seed completado exitosamente!');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Error durante el seed:', error);
  process.exit(1);
});
