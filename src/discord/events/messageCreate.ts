import { Message } from "discord.js";
import { DiscordEventHandler, DiscordClient } from "@customTypes";
import { options } from "../config";

const eventHandler: DiscordEventHandler = {
  event: "messageCreate",
  handle(message: Message) {
    if (message.channelId !== options.channelId || message.author.bot) return;
    const client = message.client as DiscordClient;
    client.eventBridge.emit('discordMessage', message.content);
  },
};

export = eventHandler;
