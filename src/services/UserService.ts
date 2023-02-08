import { Inject, Service } from "typedi";
import { Repository } from "typeorm";
import { Database } from "./Database.js";
import { User } from "../entities/User.js";

@Service()
export class UserService {
  private userRepository: Repository<User>;

  constructor(
    @Inject()
    private readonly database: Database
  ) {
    this.userRepository = this.database.getRepository(User);
  }

  async isVerified(discordId: string): Promise<boolean> {
    // TODO: Check if user is being verified
    return (
      (await this.userRepository.findOneBy({
        discordId,
      })) !== null
    );
  }

  async insertUser(
    email: string,
    discordId: string,
    name?: string,
    sub?: string
  ) {
    await this.userRepository.insert({
      email,
      discordId,
      name,
      sub,
    });
  }
}
