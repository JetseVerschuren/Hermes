import { Service } from "typedi";
import dotenv from "dotenv";

const defaultConfig = {
  discordToken: ["DISCORD_TOKEN"],
  canvasToken: ["CANVAS_TOKEN"],
  databasePath: ["DATABASE_PATH", "database.sqlite"],
  publicUrl: ["PUBLIC_URL", "http://localhost:3000"],
  userDomain: ["USER_DOMAIN", "utwente.nl"],
  port: ["PORT", 3000],
  OIDCClientId: ["OIDC_CLIENT_ID", "dda0ddea-fb54-4cdc-b2e6-7296b59b21af"],
} as const;

type ConfigType = {
  [P in keyof typeof defaultConfig]: (typeof defaultConfig)[P][1] extends number
    ? number
    : string;
};

@Service()
export class Config {
  private readonly config: ConfigType;

  constructor() {
    dotenv.config();

    // I'm done with this shit, I can't get TS to understand what I'm doing exactly

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.config = {};
    for (const [key, [envName, defaultValue]] of Object.entries(
      defaultConfig,
    )) {
      const value: string | number | undefined | null =
        process.env[envName] ?? defaultValue;
      if (value === undefined || value === "")
        throw new Error(`No ${key} specified!`);
      if (typeof defaultValue === "number") {
        const parsed = parseInt(value.toString());
        if (isNaN(parsed)) throw new Error(`${key} is not a valid number!`);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.config[key] = parsed;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.config[key] = value;
    }
  }

  getCanvasToken(): string {
    return this.config.canvasToken;
  }

  getOIDCClientId(): string {
    return this.config.OIDCClientId;
  }

  getPublicUrl(): string {
    return this.config.publicUrl;
  }

  getUserDomain(): string {
    return this.config.userDomain;
  }

  getDiscordToken(): string {
    return this.config.discordToken;
  }

  getPort(): number {
    return this.config.port;
  }

  getDatabasePath(): string {
    return this.config.databasePath;
  }
}
