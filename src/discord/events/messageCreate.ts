import { Message } from "discord.js";
import { DiscordEventHandler } from "../../types";
import { options } from "../config";

const eventHandler: DiscordEventHandler = {
  event: "messageCreate",
  async handle(message: Message) {
    if (message.channelId !== options.channelId || message.author.bot) return;
  },
};

export = eventHandler;
