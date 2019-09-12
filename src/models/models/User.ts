import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { validatorBounds } from '../validation/validatorBounds';
import { Script } from './Script';
import { Statistics } from './Statistics';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: validatorBounds.USERNAME.max })
  username!: string;

  @Column({ length: validatorBounds.PASSWORD.max })
  password!: string;

  @Column()
  email!: string;

  @Column({ default: false })
  isAdmin!: boolean;

  @Column()
  multiplayerScript!: number;

  @Column({ default: false })
  multiplayerVisible!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(type => Script, script => script.user)
  scripts!: Script[];

  @OneToOne(type => Statistics)
  @JoinColumn()
  statistics!: Statistics;
}
