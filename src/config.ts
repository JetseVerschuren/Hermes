type GuildConfig = {
  [guildId: string]: {
    announcementChannel: string;
    logChannel?: string;
  };
};

export const guildConfig: GuildConfig = {
  // Prod
  "1072100983989076098": {
    announcementChannel: "1072108873818832939",
    logChannel: "1072108615672008734",
  },
  // Test
  "874599601078935612": {
    announcementChannel: "1072194536371130450",
    logChannel: "1072317751420530740",
  },
};

type CourseConfig = {
  [courseId: string]: {
    guilds: string[];
  };
};

export const courseConfig: CourseConfig = {
  course_12067: {
    guilds: ["1072100983989076098"],
  },
  course_14337: {
    guilds: ["1072100983989076098"],
  },
};
