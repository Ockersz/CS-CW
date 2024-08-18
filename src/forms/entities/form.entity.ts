import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Form {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    name: 'name',
    length: 255,
  })
  name: string;

  @Column('varchar', {
    name: 'description',
    length: 255,
  })
  description: string;

  @Column('varchar', {
    name: 'path',
    length: 255,
  })
  path: string;

  @Column('boolean', {
    name: 'status',
    default: true,
  })
  status: boolean;

  @Column('varchar', {
    name: 'created_by',
    length: 255,
  })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('varchar', {
    name: 'updated_by',
    length: 255,
  })
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
