import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Automotor } from '../../automotores/entities/automotor.entity';
import { Vinculo } from '../../vinculo/entities/vinculo.entity';

@Entity('Objeto_De_Valor')
export class ObjetoDeValor {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  ovp_id: number;

  @Column({ type: 'varchar', length: 30, default: 'AUTOMOTOR' })
  ovp_tipo: string;

  @Column({ type: 'varchar', length: 64, unique: true, nullable: false })
  ovp_codigo: string; // será el dominio

  @Column({ type: 'varchar', length: 240, nullable: true })
  ovp_descripcion: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  updated_at: Date;

  @OneToOne(() => Automotor, (automotor) => automotor.objetoValor, {
    cascade: true,
  })
  automotor: Automotor;

  @OneToMany(() => Vinculo, (vinculo) => vinculo.objetoValor)
  vinculos: Vinculo[];
}
