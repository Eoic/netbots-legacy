import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { validatorBounds } from "../../validation/validatorBounds";
import { User } from "./User";

@Entity("scripts")
export class Script extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ length: validatorBounds.SCRIPT_FILENAME })
  public filename!: string;

  @CreateDateColumn({ type: "timestamp" })
  public createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  public updatedAt!: Date;

  @ManyToOne((type) => User, (user) => user.scripts)
  public user!: User;
}
