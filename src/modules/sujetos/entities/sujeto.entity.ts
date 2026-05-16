import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Vinculo } from '../../vinculo/entities/vinculo.entity';

@Entity('Sujeto')
export class Sujeto {
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

  @OneToMany(() => Vinculo, (vinculo) => vinculo.sujeto)
  vinculos: Vinculo[];
}
