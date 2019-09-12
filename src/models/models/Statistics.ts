import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('statistics')
export class Statistics extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: 1 })
  level!: number;

  @Column({ default: 0 })
  experience!: number;

  @Column({ default: 0 })
  gamesPlayed!: number;

  @Column({ default: 0 })
  gamesWon!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
