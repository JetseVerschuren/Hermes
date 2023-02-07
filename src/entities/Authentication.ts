import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Authentication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  discordId!: string;

  @Column()
  nonce!: string;

  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdOn!: Date;

  @Column({ nullable: true })
  token!: string;
}
