import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  email!: string;

  @Column({ unique: true })
  discordId!: string;

  @Column()
  name!: string;

  @Column()
  sub!: string;
}
