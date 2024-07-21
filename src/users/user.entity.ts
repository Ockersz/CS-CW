import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    length: 24,
    unique: true,
  })
  username: string;

  @Column('varchar', {
    length: 24,
  })
  password: string;

  @Column('varchar', {
    length: 100,
    unique: true,
  })
  email: string;

  @Column('bigint', {
    nullable: true,
  })
  role: string;

  @Column('boolean', {
    default: false,
  })
  mfa: boolean;

  @Column('boolean', {
    default: true,
  })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
