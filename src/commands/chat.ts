import { Discord, Slash, SlashOption } from "discordx";
import {
  CommandInteraction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} from "discord.js";
import ChatBot from "../chatbot.js";


const chatbot = new ChatBot();

@Discord()
class Chat {
  @Slash({ name: "chat", description: "Chat with Chat-gpt from OpenAI" })
  async chat(
    @SlashOption({
      description: "The message to send",
      name: "query",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    input: string,
    interaction: CommandInteraction
  ) {
    // already give a response to the user
    // because the chatbot takes a while to respond

    await interaction.deferReply();

    const output = await chatbot.askQuestion(input);

    //format the response
    let response = `${input}\n\n\`${output}\``;
    
    await interaction.editReply(response);


  }
}