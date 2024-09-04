import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PresDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint')
  prescriptionId: number;

  @Column('varchar', {
    length: 255,
  })
  medicine: string;

  @Column('varchar', {
    length: 255,
  })
  dosage: string;

  @Column('varchar', {
    length: 255,
  })
  duration: string;

  @Column('varchar', {
    length: 255,
  })
  frequency: string;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
