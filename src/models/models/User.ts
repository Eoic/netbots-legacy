import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { validatorBounds } from "../../validation/validatorBounds";
import { Script } from "./Script";
import { Statistics } from "./Statistics";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ length: validatorBounds.USERNAME.max })
  public username!: string;

  @Column({ length: validatorBounds.PASSWORD.max })
  public password!: string;

  @Column()
  public email!: string;

  @Column({ default: false })
  public isAdmin!: boolean;

  @Column()
  public multiplayerScript!: number;

  @Column({ default: false })
  public multiplayerVisible!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  public createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  public updatedAt!: Date;

  @OneToMany((type) => Script, (script) => script.user)
  public scripts!: Script[];

  @OneToOne((type) => Statistics)
  @JoinColumn()
  public statistics!: Statistics;
}
