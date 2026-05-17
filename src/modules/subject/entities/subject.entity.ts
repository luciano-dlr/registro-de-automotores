import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Ownership } from '../../ownership/entities/ownership.entity';

@Entity('Sujeto')
export class Subject {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  spo_id: number;

  @Column({ type: 'varchar', length: 11, unique: true, nullable: false })
  spo_cuit: string;

  @Column({ type: 'varchar', length: 160, nullable: false })
  spo_denominacion: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  updated_at: Date;

  @OneToMany(() => Ownership, (Ownership) => Ownership.sujeto)
  vinculos: Ownership[];
}
