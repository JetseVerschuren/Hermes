import { Inject, Service } from "typedi";
import { IsNull, Repository } from "typeorm";
import { Database } from "./Database.js";
import { Enrollment, EnrollmentRole } from "../entities/Enrollment.js";
import { User } from "../entities/User.js";

@Service()
export class EnrollmentService {
  private enrollmentRepository: Repository<Enrollment>;

  constructor(
    @Inject()
    private readonly database: Database
  ) {
    this.enrollmentRepository = this.database.getRepository(Enrollment);
  }

  async getRole(user: User, courseId: string): Promise<EnrollmentRole | null> {
    const name = user.name;
    if (name === null) return null;

    return (
      (
        await this.enrollmentRepository.findOneBy({
          course: courseId,
          name,
        })
      )?.role ?? null
    );
  }
}
