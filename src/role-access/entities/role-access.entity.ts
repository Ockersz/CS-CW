import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RoleAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  roleId: number;

  @Column('int')
  formId: number;

  @Column('boolean', {
    default: true,
  })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column('int')
  createdBy: number;

  @CreateDateColumn()
  updatedAt: Date;

  @Column('int')
  updatedBy: number;
}
