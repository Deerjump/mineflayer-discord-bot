import { Client, TextBasedChannel } from "discord.js";
import {
  ChatEvents,
  DiscordClient,
  DiscordBotOptions,
  DiscordEventHandler
} from "@customTypes";
import * as fs from "fs";
import TypedEmitter from "typed-emitter";

export class DiscordBot extends Client implements DiscordClient {
  private chatChannel!: TextBasedChannel;
  constructor(private config: DiscordBotOptions, public eventBridge: TypedEmitter<ChatEvents>) {
    super({ intents: config.intents });

    this.setupEventBridge();
  }

  private setupEventBridge() {
    this.eventBridge.on('minecraftMessage', async (content) => {
      this.chatChannel.send({ content });
    });
  }

  // TODO: maybe abstract this out
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

  async sendSkipRequest() {}

  async login(token: string) {
    await this.loadEvents();
    await super.login(token);
    this.getChatChannel();
    return '';
  }

  async getChatChannel() {
    const channel = await this.channels.fetch(this.config.channelId);
    if (channel == null) throw new Error("channel does not exist!");
    if (!channel.isText()) throw new Error("channel must be a TextBasedChannel");
    this.chatChannel = channel as TextBasedChannel;
  }
}
