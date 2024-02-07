import { Entity, Column, PrimaryColumn } from "typeorm";

export enum EnrollmentRole {
  Student,
  Ta,
  Teacher,
}

@Entity()
export class Enrollment {
  @PrimaryColumn()
  course!: string;

  @PrimaryColumn()
  name!: string;

  @Column({
    type: "int",
  })
  role!: EnrollmentRole;
}
