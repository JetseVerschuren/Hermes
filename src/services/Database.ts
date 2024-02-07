import { Inject, Service } from "typedi";
import { DataSource } from "typeorm";
import { Announcement } from "../entities/Announcement.js";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";
import { EntityTarget } from "typeorm/common/EntityTarget";
import { Repository } from "typeorm/repository/Repository";
import { Authentication } from "../entities/Authentication.js";
import { User } from "../entities/User.js";
import { Config } from "./Config.js";
import { Enrollment } from "../entities/Enrollment.js";

@Service()
export class Database {
  private readonly dataSource: DataSource;

  constructor(
    @Inject()
    private readonly config: Config
  ) {
    this.dataSource = new DataSource({
      type: "sqlite",
      database: config.getDatabasePath(),
      synchronize: true,
      entities: [Announcement, User, Authentication, Enrollment],
    });
  }

  getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>
  ): Repository<Entity> {
    return this.dataSource.getRepository(target);
  }

  initialize() {
    return this.dataSource.initialize();
  }
}
