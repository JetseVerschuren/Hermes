import { Client } from "discordx";
import { courseConfig, guildConfig } from "../config.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import fetch from "node-fetch";
import { htmlToMarkdown } from "../htmlToMarkdown.js";
import { Inject, Service } from "typedi";
import { AnnouncementService } from "./AnnouncementService.js";
import { Config } from "./Config.js";

type AnnouncementObject = {
  id: number;
  title: string;
  message: string;
  url: string;
  author: {
    displayName: string;
    avatarImageUrl: string;
  };
  postedAt: Date;
  contextCode: string;
};

@Service()
export class Canvas {
  @Inject()
  private announcementRepository!: AnnouncementService;

  @Inject()
  private config!: Config;

  @Inject("bot")
  private bot!: Client;

  ready() {
    setInterval(() => {
      try {
        return this.onInterval();
      } catch (e) {
        console.error(e);
      }
    }, 60 * 1000);
  }

  async onInterval() {
    console.log("Checking Canvas announcements");
    const announcements = await this.fetchAnnouncements(
      Object.keys(courseConfig),
      await this.announcementRepository.lastMessageDate()
    );

    for (const announcement of announcements) {
      // Canvas should already filter out old announcements, but let's double-check
      if (await this.announcementRepository.exists(announcement.id)) {
        console.log(`Duplicate announcement: ${announcement.id}`);
        continue;
      }

      await this.announcementRepository.insert({
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        url: announcement.url,
        postedAt: announcement.postedAt,
        contextCode: announcement.contextCode,
        authorDisplayName: announcement.author.displayName,
        authorAvatarImageUrl: announcement.author.avatarImageUrl,
      });

      const guilds = courseConfig[announcement.contextCode]?.guilds;
      if (!guilds) continue;
      // TODO: Check if it's an old announcement
      await this.publishMessage(
        announcement,
        guilds
          .map((guild) => guildConfig[guild]?.announcementChannel)
          .filter((channel): channel is string => !!channel)
      );
    }
  }

  async publishMessage(announcement: AnnouncementObject, channels: string[]) {
    // TODO: The announcement can contain attachments, perhaps send to to DC as well
    const embed = new EmbedBuilder()
      .setAuthor({
        name: announcement.author.displayName,
        iconURL: announcement.author.avatarImageUrl,
      })
      .setTitle(announcement.title)
      .setDescription(htmlToMarkdown(announcement.message))
      .setURL(announcement.url)
      .setTimestamp(announcement.postedAt);

    for (const channelId of channels) {
      const channel = await this.bot.channels.fetch(channelId);
      if (!channel) continue;
      // TODO: Find a better solution than casting
      await (channel as TextChannel).send({ embeds: [embed] });
    }
  }

  async fetchAnnouncements(
    courseCodes: string[],
    startDate: Date | null = null
  ): Promise<AnnouncementObject[]> {
    // (see https://canvas.instructure.com/doc/api/announcements.html for more details)
    const url = new URL("https://canvas.utwente.nl/api/v1/announcements");
    const params = url.searchParams;
    for (const courseCode of courseCodes) {
      params.append("context_codes[]", courseCode);
    }
    // Only include published announcements, just in case the token has those permissions
    params.append("active_only", "true");
    if (startDate) params.append("start_date", startDate.toISOString());
    params.append("access_token", this.config.getCanvasToken());

    const response = await fetch(url.toString(), { method: "GET", body: null });

    // TODO: Better validate shape of announcements
    const json = (await response.json()) as any;

    if (!(json instanceof Array)) {
      console.error(
        `INVALID RESPONSE FROM API. Request: ${url.toString()}, response: `,
        response
      );
      return []; //TODO: Make errors more explicit.
    }

    return json.map(
      (raw: any) =>
        ({
          id: raw.id,
          title: raw.title,
          message: raw.message,
          url: raw.url,
          author: {
            displayName: raw.author.display_name,
            avatarImageUrl: raw.author.avatar_image_url,
          },
          postedAt: new Date(Date.parse(raw.posted_at)),
          contextCode: raw.context_code,
        } as AnnouncementObject)
    );
  }
}
