import { Discord, Slash } from "discordx";
import { CommandInteraction, GuildMember } from "discord.js";
import { Inject } from "typedi";
import { UserService } from "../services/UserService.js";
import { AuthenticationService } from "../services/AuthenticationService.js";
import { EnrollmentService } from "../services/EnrollmentService.js";
import { guildConfig } from "../config.js";
import { EnrollmentRole } from "../entities/Enrollment.js";

@Discord()
class Verify {
  @Inject()
  private userService!: UserService;

  @Inject()
  private authenticationService!: AuthenticationService;

  @Inject()
  private enrollmentService!: EnrollmentService;

  @Slash({
    name: "verify",
    description: "Verify whether you're registered on Canvas",
  })
  async link(interaction: CommandInteraction) {
    if (
      !(interaction.member instanceof GuildMember) ||
      interaction.guild === null
    )
      return;

    const discordId = interaction.user.id as string;
    const user = await this.userService.getUserFromUsername(discordId);
    if (user === null) {
      await interaction.reply({
        content: "Please link your university account first",
        ephemeral: true,
      });
      return;
    }

    const course = guildConfig[interaction.guild.id]?.course;
    if (!course) {
      await interaction.reply({
        content: "Sorry, this command wasn't executed from a registered server",
        ephemeral: true,
      });
      return;
    }

    const role = await this.enrollmentService.getRole(user, course);
    if (role === null) {
      await interaction.reply({
        content: `You don't seem to be registered on Canvas`,
        ephemeral: true,
      });
    }

    let suffix = "";
    let discordRoleId = null;
    switch (role) {
      case EnrollmentRole.Student:
        discordRoleId = guildConfig[interaction.guild.id]?.studentRole;
        break;
      case EnrollmentRole.Ta:
        suffix = " (TA)";
        discordRoleId = guildConfig[interaction.guild.id]?.teacherRole;
        break;
      case EnrollmentRole.Teacher:
        suffix = " (Teacher)";
        discordRoleId = guildConfig[interaction.guild.id]?.teacherRole;
        break;
    }

    await interaction.member.setNickname(`${user.name ?? ""}${suffix}`);
    if (discordRoleId) {
      const discordRole = interaction.guild.roles.cache.get(discordRoleId);
      if (discordRole) await interaction.member.roles.add(discordRole);
    }

    await interaction.reply({
      content: `Successfully verified your enrollment status!`,
      ephemeral: true,
    });
  }
}
