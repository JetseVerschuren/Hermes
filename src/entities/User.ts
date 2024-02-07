import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  email!: string;

  @Column({ unique: true })
  discordId!: string;

  @Column({ nullable: true, type: "varchar" })
  name!: string | null;

  @Column({ nullable: true, type: "varchar" })
  sub!: string | null;
}
