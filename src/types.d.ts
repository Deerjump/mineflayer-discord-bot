import { Client, ClientEvents, Intents } from "discord.js";

export interface DiscordBot extends Client {
  send: (content: string) => Promise;
}

export interface DiscordBotOptions {
  intents: Intents;
  channelId: string;
}

export interface DiscordEventHandler {
  event: keyof ClientEvents;
  once?: boolean;
  handle: (...args: any[]) => void;
}

export interface MineflayerEventHandler {
  
}
