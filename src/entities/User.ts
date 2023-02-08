import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  email!: string;

  @Column({ unique: true })
  discordId!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  sub!: string;
}
