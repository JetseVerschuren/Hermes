import { Client } from "discordx";
import { courseConfig } from "./config.js";
import { EmbedBuilder, TextChannel } from "discord.js";

export class Canvas {
  private interval: NodeJS.Timer | null = null;
  constructor(private bot: Client, private token: string) {}

  ready() {
    this.interval = setInterval(this.onInterval.bind(this), 60 * 1000);
  }

  onInterval() {
    for (const [courseId, { guilds }] of Object.entries(courseConfig)) {
      // TODO: Fetch announcements
      const announcements: any[] = [];
      // TODO: Filter out old announcements
      for (const announcement of announcements) {
        // TODO: Post announcement in the configured guilds
      }
    }
  }

  async publishMessage(announcement: any, channels: string[]) {
    // TODO: The announcement can contain attachments, perhaps send to to DC as well
    // TODO: Format the Canvas announcement according to DC markdown
    const embed = new EmbedBuilder()
      .setAuthor({
        name: announcement.author.displayName,
        iconURL: announcement.author.avatarImageUrl,
      })
      .setTitle(announcement.title)
      .setDescription(announcement.message)
      .setURL(announcement.url);

    for (const channelId of channels) {
      const channel = await this.bot.channels.fetch(channelId);
      if (!channel) continue;
      // TODO: Find a better solution than casting
      await (channel as TextChannel).send({ embeds: [embed] });
    }
  }
}
