import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("statistics")
export class Statistics extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ default: 1 })
  public level!: number;

  @Column({ default: 0 })
  public experience!: number;

  @Column({ default: 0 })
  public gamesPlayed!: number;

  @Column({ default: 0 })
  public gamesWon!: number;

  @CreateDateColumn({ type: "timestamp" })
  public createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  public updatedAt!: Date;
}
