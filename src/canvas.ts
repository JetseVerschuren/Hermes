import { Client } from "discordx";
import { courseConfig } from "./config.js";
import fetch from "node-fetch";

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
    for (const [courseId, { guilds }] of Object.entries(courseConfig)) {
      // TODO: Fetch announcements
      const announcements: Announcement[] = [];
      // TODO: Filter out old announcements
      for (const announcement of announcements) {
        // TODO: Post announcement in the configured guilds
      }
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

    if (json.message) {
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
