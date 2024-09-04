import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Prescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    length: 255,
  })
  name: string;

  @Column('varchar', {
    length: 255,
  })
  description: string;

  @Column('varchar', {
    length: 255,
  })
  doctor: string;

  @Column('bigint')
  patient: number;

  @Column('date')
  date: Date;

  @Column('varchar', {
    length: 1,
  })
  status: string;

  @Column('varchar', {
    length: 255,
  })
  notes: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('bigint')
  created_by: number;

  @CreateDateColumn()
  created_at: Date;
}
