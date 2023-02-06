import { Client } from "discordx";
import { courseConfig } from "./config.js";

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
}
