import { Service } from "typedi";
import { DataSource } from "typeorm";
import { databasePath } from "../config.js";
import { Announcement } from "../entities/Announcement.js";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";
import { EntityTarget } from "typeorm/common/EntityTarget";
import { Repository } from "typeorm/repository/Repository";
import { Authentication } from "../entities/Authentication.js";
import { User } from "../entities/User.js";

@Service()
export class Database {
  private readonly dataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      type: "sqlite",
      database: databasePath,
      synchronize: true,
      entities: [Announcement, User, Authentication],
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
