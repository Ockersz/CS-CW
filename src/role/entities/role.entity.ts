import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    name: 'name',
    length: 100,
  })
  name: string;

  @Column('varchar', {
    name: 'description',
    length: 255,
    nullable: true,
  })
  description: string | null;

  @Column('boolean', {
    name: 'status',
    default: true,
  })
  status: boolean;

  @Column('boolean', {
    name: 'full_access',
    default: false,
  })
  fullAccess: boolean;

  @Column('varchar', {
    name: 'created_by',
    length: 255,
    nullable: true,
  })
  createdBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column('varchar', {
    name: 'updated_by',
    length: 255,
    nullable: true,
  })
  updatedBy: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
