import { Inject, Service } from "typedi";
import { IsNull, Not, Repository } from "typeorm";
import { Announcement } from "../entities/Announcement.js";
import { Database } from "./Database.js";

@Service()
export class AnnouncementService {
  private announcementRepository: Repository<Announcement>;

  constructor(
    @Inject()
    private readonly database: Database
  ) {
    this.announcementRepository = this.database.getRepository(Announcement);
  }

  async lastMessageDate(): Promise<Date | undefined> {
    return (
      await this.announcementRepository.findOne({
        where: { postedAt: Not(IsNull()) },
        order: { postedAt: "DESC" },
      })
    )?.postedAt;
  }

  async exists(announcementId: number): Promise<boolean> {
    return (
      (await this.announcementRepository.findOneBy({
        id: announcementId,
      })) !== null
    );
  }

  insert(announcement: Announcement) {
    return this.announcementRepository.insert(announcement);
  }
}
