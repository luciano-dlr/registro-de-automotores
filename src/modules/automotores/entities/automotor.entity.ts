import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ObjetoDeValor } from '../../objeto-valor/entities/objeto-valor.entity';

@Entity('Automotores')
export class Automotor {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  atr_id: number;

  @Column({ type: 'bigint', name: 'atr_ovp_id' })
  atr_ovp_id: number;

  @Column({ type: 'varchar', length: 8, unique: true, nullable: false })
  atr_dominio: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  atr_numero_chasis: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  atr_numero_motor: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  atr_color: string;

  @Column({ type: 'int', nullable: false })
  atr_fecha_fabricacion: number;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  atr_fecha_alta_registro: Date;

  @OneToOne(() => ObjetoDeValor)
  @JoinColumn({ name: 'atr_ovp_id' })
  objetoValor: ObjetoDeValor;
}
