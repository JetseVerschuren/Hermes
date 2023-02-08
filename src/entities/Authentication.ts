import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity()
export class Authentication extends BaseEntity {
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
