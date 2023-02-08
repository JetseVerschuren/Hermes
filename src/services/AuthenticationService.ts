import { Inject, Service } from "typedi";
import { IsNull, Repository } from "typeorm";
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

  async updateAttempt(
    id: number,
    nonce: string,
    token: string
  ): Promise<string | undefined> {
    // TODO: Check createdOn is not too long ago
    const attempt = await this.authenticationRepository.findOneBy({
      id,
      nonce,
      token: IsNull(),
    });
    if (!attempt) return undefined;

    attempt.token = token;
    await attempt.save();

    return attempt.discordId;
  }
}
