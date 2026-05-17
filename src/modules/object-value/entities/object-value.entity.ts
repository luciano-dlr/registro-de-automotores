import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Ownership } from '../../ownership/entities/ownership.entity';

@Entity('Objeto_De_Valor')
export class ObjectValue {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  ovp_id: number;

  @Column({ type: 'varchar', length: 30, default: 'AUTOMOTOR' })
  ovp_tipo: string;

  @Column({ type: 'varchar', length: 64, unique: true, nullable: false })
  ovp_codigo: string;

  @Column({ type: 'varchar', length: 240, nullable: true })
  ovp_descripcion: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  updated_at: Date;

  @OneToOne(() => Vehicle, (Vehicle) => Vehicle.objetoValor, {
    cascade: true,
  })
  automotor: Vehicle;

  @OneToMany(() => Ownership, (Ownership) => Ownership.objetoValor)
  vinculos: Ownership[];
}
