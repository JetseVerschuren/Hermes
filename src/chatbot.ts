import OpenAI from "openai-api";
import { openaiToken } from "./config.js";

export default class ChatBot {
    private previousConversation = "";

    // thanks Luna, just copypastad this from your code :D
    private createOpenaiApi = (apiKey: string) => {
        return new OpenAI(apiKey);
    }

    private getApiKey = () => {
        return openaiToken;//process.env.OPENAI_API_KEY;
    }

    public askQuestion = async (question: string) => {
        let key = this.getApiKey();
        if (key == undefined) {
            throw new Error("No OpenAI API key found");
        }

        const openai = this.createOpenaiApi(key);

        console.log(question);

        const convo = `Human:${question}\nBot:`;
        

        const completion = await openai.complete({
            engine: "text-davinci-003",
            prompt: convo,
            temperature: 0.9,
            maxTokens: 150,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
            stop: [" Human:", " Bot:"]
        });

        const response = completion.data.choices[0].text.trim();

        this.previousConversation += `${response}\n`;

        console.log(response);

        //format the response
        // Question: <question>
        // Answer: <response>

        return response;
    }
}