import { Entity, Column, PrimaryColumn } from "typeorm";

// @ts-ignore strictPropertyInitialization
@Entity()
export class Announcement {
  @PrimaryColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  message!: string;

  @Column()
  url!: string;

  @Column()
  postedAt!: Date;

  @Column()
  contextCode!: string;

  @Column()
  authorDisplayName!: string;

  @Column()
  authorAvatarImageUrl!: string;
}
