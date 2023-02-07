import { Client } from "discordx";
import { courseConfig, guildConfig } from "./config.js";
import { EmbedBuilder, TextChannel } from "discord.js";
import fetch from "node-fetch";
import { htmlToMarkdown } from "./htmlToMarkdown.js";
import { IsNull, Not, Repository } from "typeorm";
import { Announcement } from "./entities/Announcement.js";

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

export class Canvas {
  private interval: NodeJS.Timer | null = null;

  constructor(
    private bot: Client,
    private token: string,
    private announcementRepository: Repository<Announcement>
  ) {}

  ready() {
    // this.interval = setInterval(this.onInterval.bind(this), 60 * 1000);
    this.onInterval();
  }

  async onInterval() {
    const lastMessageDate = (
      await this.announcementRepository.findOne({
        where: { postedAt: Not(IsNull()) },
        order: { postedAt: "ASC" },
      })
    )?.postedAt;
    const announcements = await this.fetchAnnouncements(
      Object.keys(courseConfig),
      lastMessageDate
    );

    for (const announcement of announcements) {
      // Canvas should already filter out old announcements, but let's double-check
      if (
        (await this.announcementRepository.findOneBy({
          id: announcement.id,
        })) !== null
      ) {
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
        } as AnnouncementObject)
    );
    // return [
    //   {
    //     id: 183381,
    //     title: "ADS Study groups",
    //     message: `<p>For students doing ADS:</p><ul><li>if you were at the kickoff meeting and have found a group, don't forget to enrol in your group at Canvas!</li><li>if you were not at the kickoff (on February 6): carefully read the instructions "ADS instructions" of the ADS module. Then either enrol in an empty group, or politely ask a group that is not yet full if you can join them (group 2 is reserved for NEDAP students).</li></ul>`,
    //     url: "https://canvas.utwente.nl/courses/12067/discussion_topics/183381",
    //     author: {
    //       displayName: "Rom Langerak",
    //       avatarImageUrl:
    //         "https://canvas.utwente.nl/images/thumbnails/128719/L45UCRC42UYrCMArpFUXAUYd6bQKai6VK0OQcdHT",
    //     },
    //     postedAt: new Date("2023-02-06T14:11:18.000Z"),
    //     contextCode: "course_12067",
    //   },
    //   {
    //     id: 183268,
    //     title: "Strikes & Streaming",
    //     message:
    //       "<p>Dear students,</p><p>because of the strikes in public transport this week, we had and have to improvise a bit as to what we (can) offer online. We had streamed the Kickoff meeting of today, and at least some of you were able to make us of that option. Some teaching formats however are not well suited for streaming. Let me therefore summarize</p><ul><li>For the first lecture in Discrete Mathematics (today 10:45-12:30), also a pre-recorded lecture is available on Canvas (but no streaming); students who missed this lecture should watch the Video. The tutorials (Tuesday 10:45 in SP1 and SP5) cannot be streamed, in case you cannot come to campus, you may ask questions online via MS-Teams (link on Canvas).</li><li>The Kickoff&nbsp; for the Algorithms &amp; Data Structures (today 13:45 in WA2), is not suited for streaming; as a major part is the formation of the study groups; students who miss that part will be notified about their groups by Rom Langerak afterwards.</li><li>The first lectorial for the implementation project (Tuesday 13:45 in VR583) is meant for a the (small) group of students that prefer to get a refreshment in programming in python; (only) some parts of it might be streamed but only if really necessary, then please contact Ruben Hoeksma. The practical sessions later that week are not streamable, in case you cannot attend please work on the assignments and ask questions the week after.</li><li>For the first Algebra lecture (Wednesday 10:45 in Agora) we will try to setup the lecture also for streaming, technical issues pending (as this is the theater room), so if possible come to campus. The Q&amp;A session (Thursday 15:45 in WA2) is with all Algebra teaching staff and not suited for streaming.</li></ul><p>I wish all you you a successful start (nevertheless).</p><p>Marc (on behalf of the M7 team)</p>",
    //     url: "https://canvas.utwente.nl/courses/12067/discussion_topics/183268",
    //     author: {
    //       displayName: "Marc Uetz",
    //       avatarImageUrl:
    //         "https://canvas.utwente.nl/images/thumbnails/421697/F7OkEkPZbuk1CAuCdqsGaNMorgMxPr0wgaPvv8iP",
    //     },
    //     postedAt: new Date("2023-02-06T11:08:07.000Z"),
    //     contextCode: "course_12067",
    //   },
    // ];
  }
}
