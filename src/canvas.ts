import { Client } from "discordx";
import { courseConfig, guildConfig } from "./config.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import fetch from "node-fetch";
import { htmlToMarkdown } from "./htmlToMarkdown.js";

type Announcement = {
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

export class Canvas {
  private interval: NodeJS.Timer | null = null;
  constructor(private bot: Client, private token: string) {}

  ready() {
    this.interval = setInterval(this.onInterval.bind(this), 60 * 1000);
  }

  async onInterval() {
    // TODO: Get date of last announcement
    const announcements = await this.fetchAnnouncements(
      Object.keys(courseConfig)
    );

    for (const announcement of announcements) {
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

  async publishMessage(announcement: Announcement, channels: string[]) {
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
  ): Promise<Announcement[]> {
    // (see https://canvas.instructure.com/doc/api/announcements.html for more details)
    const url = new URL("https://canvas.utwente.nl/api/v1/announcements");
    const params = url.searchParams;
    for (const courseCode of courseCodes) {
      params.append("context_codes[]", courseCode);
    }
    // Only include published announcements, just in case the token has those permissions
    params.append("active_only", "true");
    if (startDate) params.append("start_date", startDate.toISOString());
    params.append("access_token", this.token);

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
        } as Announcement)
    );
  }
}
