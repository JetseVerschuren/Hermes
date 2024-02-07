type GuildConfig = {
  [guildId: string]: {
    announcementChannel: string;
    course: string;
    logChannel?: string;
    studentRole?: string;
    teacherRole?: string;
  };
};

export const guildConfig: GuildConfig = {
  // Prod
  "1072100983989076098": {
    announcementChannel: "1072108873818832939",
    course: "course_14337",
    logChannel: "1072108615672008734",
    studentRole: "1072110378823204965",
    teacherRole: "1074083915511382026",
  },
  // Test
  "874599601078935612": {
    announcementChannel: "1072194536371130450",
    course: "course_12067",
    logChannel: "1072317751420530740",
    teacherRole: "1204843625700130836",
    studentRole: "1204843656343855175",
  },
};

// Use a Set to de-duplicate courses
export const courseCodes = [
  ...new Set(
    Object.values(guildConfig).map((guildConfig) => guildConfig.course)
  ),
];
