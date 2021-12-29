import { Client, TextBasedChannel } from "discord.js";
import { DiscordBot, DiscordBotOptions, DiscordEventHandler } from "../types";
import * as fs from "fs";

export class Bot extends Client implements DiscordBot {
  readonly config: DiscordBotOptions;

  constructor(config: DiscordBotOptions) {
    super({ intents: config.intents });
    this.config = config;
  }

  private async loadEvents() {
    console.log("Loading events...");

    const eventFiles = fs.readdirSync(`${__dirname}/events`).filter((file) => file.endsWith(".js"));

    let count = 0;
    for (const file of eventFiles) {
      const { once, event, handle } = (await import(`./events/${file}`)) as DiscordEventHandler;
      once ? this.once(event, handle) : this.on(event, handle);
      count++;
    }

    console.log(`Loaded ${count} events`);
  }

  async send(content: string) {
    let channel = this.channels.cache.get(this.config.channelId);
    if (channel == null) throw new Error("channel does not exist!");
    if (!channel.isText()) throw new Error("channel must be a TextBasedChannel");
    channel = channel as TextBasedChannel;
    channel.send({ content });
  }

  async login(token: string) {
    await this.loadEvents();
    return super.login(token);
  }
}
