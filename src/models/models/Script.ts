import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { validatorBounds } from '../validation/validatorBounds';
import { User } from './User';

@Entity('scripts')
export class Script extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: validatorBounds.SCRIPT_FILENAME })
  filename!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(type => User, user => user.scripts)
  user!: User;
}
