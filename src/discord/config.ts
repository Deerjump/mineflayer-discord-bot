import { Intents } from "discord.js";
import { DiscordBotOptions } from "../types";

export const options: DiscordBotOptions = {
  intents: new Intents(['GUILDS', 'GUILD_MESSAGES']),
  channelId: "925551422949433374" 
}