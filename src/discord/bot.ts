import { Client, ClientEvents, TextBasedChannel } from 'discord.js';
import { DiscordClient, DiscordBotOptions, EventHandler, EventBridge } from '@customTypes';
import fs from 'fs';

export class DiscordBot extends Client implements DiscordClient {
  private chatChannel?: TextBasedChannel;
  private skipChannel?: TextBasedChannel;
  private logChannel?: TextBasedChannel;

  constructor(public readonly config: DiscordBotOptions, public readonly eventBridge: EventBridge) {
    super({ intents: config.intents });
  }

  private setupEventBridge() {
    this.eventBridge.on('minecraftMessage', this.handleMinecraftMessage.bind(this));
    this.eventBridge.on('connectionFailure', this.handleConnectionFailure.bind(this));
    this.eventBridge.on('notifyStaff', this.notifyStaff.bind(this));
  }

  private async handleMinecraftMessage(message: string) {
    const messageToSend = { content: message };

    const channel = this.getChatChannel();
    await channel.send(messageToSend);
  }

  private async handleConnectionFailure(reason: string) {
    const message = { content: `**Trouble connecting to housing:** \`${reason}\`` };

    const channel = this.getChatChannel();
    await channel.send(message);
  }

  private async notifyStaff(username: string, reason?: string) {
    const channel = this.getChatChannel();

    await channel.send(`<@&${this.config.staffRoleId}> ${username} requests your help!`);
  }

  private async loadDiscordEvents() {
    console.log('Loading DiscordBot events...');

    const path = '/events';
    const eventFiles = fs.readdirSync(`${__dirname}${path}`).filter((file) => file.endsWith('.js'));

    let count = 0;
    for (const file of eventFiles) {
      const { once, event, handle } = (await import(
        `.${path}/${file}`
      )) as EventHandler<ClientEvents>;
      once ? this.once(event, handle) : this.on(event, handle);
      count++;
    }

    console.log(`Loaded ${count} DiscordBot events`);
  }

  private async loadChannels() {
    this.chatChannel = await this.getTextChannel(this.config.chatChannelId);
    this.skipChannel = await this.getTextChannel(this.config.skipChannelId);
    this.logChannel = await this.getTextChannel(this.config.loggingChannelId);
  }

  async login(token: string) {
    await this.loadDiscordEvents();
    this.setupEventBridge();
    await super.login(token);
    await this.loadChannels();
    return '';
  }

  private async getTextChannel(id: string) {
    const channel = await this.channels.fetch(id);
    if (channel == null) throw new Error('channel does not exist!');
    if (!channel.isText()) throw new Error('channel must be a TextBasedChannel');
    return channel as TextBasedChannel;
  }

  getChatChannel() {
    return this.chatChannel!;
  }

  getSkipChannel() {
    return this.skipChannel!;
  }

  getLogChannel() {
    return this.logChannel!;
  }
}
