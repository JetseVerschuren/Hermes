import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client, DIService, typeDiDependencyRegistryEngine } from "discordx";
import { Canvas } from "./services/Canvas.js";
import { Container, Service } from "typedi";
import { Database } from "./services/Database.js";
import { Koa } from "@discordx/koa";
import bodyParser from "koa-bodyparser";
import { Config } from "./services/Config.js";

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.MessageContent,
  ],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: "!",
  },
});

DIService.engine = typeDiDependencyRegistryEngine
  .setService(Service)
  .setInjector(Container);

bot.once("ready", async () => {
  // Make sure all guilds are cached
  // await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  // Make sure this is executed after the importx
  Container.set("bot", bot);
  const canvas = DIService.engine.getService(Canvas);
  if (!canvas) throw new Error("Failed to start canvas service");
  canvas.ready();

  console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
  bot.executeCommand(message);
});

async function run() {
  const config = Container.get(Config);
  const database = Container.get(Database);
  await database.initialize();

  await importx(
    `${dirname(import.meta.url)}/{events,commands,services,api}/**/*.{ts,js}`
  );

  await bot.login(config.getDiscordToken());

  const server = new Koa();
  server.use(bodyParser());
  await server.build();
  server.listen(config.getPort(), () => {
    console.log(`api started on port ${config.getPort()}`);
  });
}

run();
