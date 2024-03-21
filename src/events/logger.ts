import { ArgsOf, Discord, On, Client } from "discordx";
import { EmbedBuilder, TextChannel } from "discord.js";
import { guildConfig } from "../config.js";

@Discord()
export class Logger {
  @On({ event: "messageDelete" })
  async messageDelete([message]: ArgsOf<"messageDelete">, client: Client) {
    // TODO: Add who deleted the message

    if (!message.guild) return;
    const logChannel = guildConfig[message.guild.id]?.logChannel;
    if (!logChannel) return;
    const embed = new EmbedBuilder()
      .setTitle(`Message deleted in #${(message.channel as TextChannel).name}`)
      .setDescription(`${message.content}\n\nMessage ID: ${message.id}`)
      .setColor(14507859)
      .setTimestamp(new Date()) // TODO: Check if DC has a deleted on timestamp
      .setAuthor({
        name: message.author?.tag ?? "Unknown",
        iconURL: message.author?.avatarURL() ?? undefined,
      })
      .setFooter({
        text: `ID: ${message.author?.id}`,
      });

    if (message.attachments.size > 0) {
      embed.addFields({
        name: "Attachments",
        value: message.attachments
          .map((attachment) => `[${attachment.name}](${attachment.url})`)
          .join("\n"),
      });
    }

    const channel = await client.channels.fetch(logChannel);
    if (!channel) return;
    await (channel as TextChannel).send({ embeds: [embed] });
  }

  @On({ event: "messageUpdate" })
  async messageUpdate(
    [oldMessage, newMessage]: ArgsOf<"messageUpdate">,
    client: Client,
  ) {
    if (!oldMessage.guild) return;
    const logChannel = guildConfig[oldMessage.guild.id]?.logChannel;
    if (!logChannel) return;
    if (oldMessage.author?.bot) return;
    const embed = new EmbedBuilder()
      .setURL(oldMessage.url)
      .setTitle(
        `Message edited in #${(oldMessage.channel as TextChannel).name}`,
      )
      .setDescription(
        `**Before:** ${oldMessage.content}\n**+After:** ${newMessage.content}`,
      )
      .setColor(4359924)
      .setTimestamp(new Date())
      .setAuthor({
        name: oldMessage.author?.tag ?? "Unknown",
        iconURL: oldMessage.author?.avatarURL() ?? undefined,
      })
      .setFooter({
        text: `ID: ${oldMessage.author?.id}`,
      });

    const channel = await client.channels.fetch(logChannel);
    if (!channel) return;
    await (channel as TextChannel).send({ embeds: [embed] });
  }
}
