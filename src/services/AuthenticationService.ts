import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { Database } from "./Database.js";
import { Authentication } from "../entities/Authentication.js";

@Service()
export class AuthenticationService {
  private authenticationRepository: Repository<Authentication>;

  constructor(
    @Inject()
    private readonly database: Database
  ) {
    this.authenticationRepository = this.database.getRepository(Authentication);
  }

  async newAttempt(
    discordId: string
  ): Promise<Pick<Authentication, "id" | "nonce">> {
    // TODO: Generate nonce
    const nonce = "abc";

    const attemptId: number = (
      await this.authenticationRepository.insert({
        discordId,
        nonce,
      })
    ).raw;

    return {
      id: attemptId,
      nonce: nonce,
    };
  }
}
