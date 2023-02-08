import { Discord, Slash } from "discordx";
import { CommandInteraction } from "discord.js";
import { Inject } from "typedi";
import { UserService } from "../services/UserService.js";
import { AuthenticationService } from "../services/AuthenticationService.js";
import { OIDC } from "../services/oidc.js";

@Discord()
class Verify {
  @Inject()
  private userService!: UserService;

  @Inject()
  private authenticationService!: AuthenticationService;

  @Inject()
  private oidc!: OIDC;

  @Slash({ name: "verify", description: "Link your uni account to Discord" })
  async verify(interaction: CommandInteraction) {
    const userID = interaction.user.id as string;
    if (await this.userService.isVerified(userID)) {
      await interaction.reply({
        content: "Sorry, you can only register once",
        ephemeral: true,
      });
      return;
    }
    const { id: attemptId, nonce } =
      await this.authenticationService.newAttempt(userID);
    const url = this.oidc.generateLoginUrl(attemptId, nonce);
    await interaction.reply({
      content: `You can login via the following link: ${url}`,
      ephemeral: true,
    });
  }
}
