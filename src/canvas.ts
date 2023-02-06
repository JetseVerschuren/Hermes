import { Client } from "discordx";
import { courseConfig } from "./config.js";iimport fetch from 'node-fetch'; //requests explained in https://stackoverflow.com/questions/45748476/http-request-in-typescript


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

  async fetchAnnouncements(course_codes : string[], start_date : Date) {
    // (see https://canvas.instructure.com/doc/api/announcements.html for more details)

    const params = new URLSearchParams(); 
    for (const course_code of course_codes) {
        params.append("context_codes[]", course_code); 
    } 
    params.append("active_only", "true"); //only include active 
    params.append("start_date", start_date.toISOString()); 

    const response = await fetch("https://canvas.utwente.nl/api/v1/announcements" , { method:"GET", body: params });
    const data = await response.json();
  }
}
