import dotenv from "dotenv";

type GuildConfig = {
  [guildId: string]: {
    announcementChannel: string;
    logChannel?: string;
  };
};

export const guildConfig: GuildConfig = {
  "1072100983989076098": {
    announcementChannel: "1072108873818832939",
    logChannel: "1072108615672008734",
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
};

dotenv.config();

function getEnvVar(key: string, fallback: string): string;
function getEnvVar(key: string): string;

function getEnvVar(key: string, fallback?: string): string {
  const val = process.env[key];
  if (val) return val;
  if (fallback) return fallback;
  throw new Error(`No ${key} specified!`);
}


export const discordToken = getEnvVar("DISCORD_TOKEN");
export const canvasToken = getEnvVar("CANVAS_TOKEN");
export const openaiToken = getEnvVar("OPENAI_TOKEN");
export const databasePath = getEnvVar("DATABASE_PATH", "database.sqlite");
