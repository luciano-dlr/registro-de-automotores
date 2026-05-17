import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ObjectValue } from '../../object-value/entities/object-value.entity';
import { Subject } from '../../subject/entities/subject.entity';

@Entity('Vinculo_Sujeto_Objeto')
export class Ownership {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  vso_id: number;

  @Column({ type: 'bigint', name: 'vso_ovp_id' })
  vso_ovp_id: number;

  @Column({ type: 'bigint', name: 'vso_spo_id' })
  vso_spo_id: number;

  @Column({ type: 'varchar', length: 30, default: 'DUENO' })
  vso_tipo_vinculo: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 100 })
  vso_porcentaje: number;

  @Column({ type: 'char', length: 1, default: 'S' })
  vso_responsable: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  vso_fecha_inicio: Date;

  @Column({ type: 'date', nullable: true })
  vso_fecha_fin: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  created_at: Date;

  @ManyToOne(() => ObjectValue, (ov) => ov.vinculos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vso_ovp_id' })
  objetoValor: ObjectValue;

  @ManyToOne(() => Subject, (Subject) => Subject.vinculos, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vso_spo_id' })
  sujeto: Subject;
}
