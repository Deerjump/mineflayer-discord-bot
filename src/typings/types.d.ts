import { Awaitable, Client, ClientEvents, Intents, TextBasedChannel, User } from 'discord.js';
import { Bot, BotEvents, BotOptions } from 'mineflayer';
import TypedEmitter from 'typed-emitter';

export interface DiscordClient extends Client {
  config: DiscordBotOptions;
  eventBridge: EventBridge;
  getChatChannel: () => TextBasedChannel;
  getSkipChannel: () => TextBasedChannel;
  getLogChannel: () => TextBasedChannel;
}

export interface DiscordBotOptions {
  intents: Intents;
  chatChannelId: string;
  skipChannelId: string;
  loggingChannelId: string;
  staffRoleId: string;
}

export interface MinecraftBotOptions extends BotOptions {
  housingOwner: string;
  prefix: string;
  parkourStart: Location;
  parkourTimeBanThreshold: number;
}

export type EventBridge = TypedEmitter<CustomEvents>;

export type InferParams<T> = T extends unknown[]
  ? T
  : T extends (...args: never) => unknown
  ? Parameters<T>
  : never;

export type Callback<T, R> = (...args: T) => R;
export type Predicate<T> = Callback<T, boolean>;

export interface EventHandler<T, K extends keyof T = keyof T> {
  event: K;
  once?: boolean;
  handle: (...args: InferParams<T[K]>) => void;
}

export interface CustomEvents {
  notifyStaff: (username: string, reason?: string) => void;
  discordMessage: (message: string) => void;
  minecraftMessage: (message: string) => void;
  connectionFailure: (reason: string) => void;
  skipRequestCommand: (username: string) => void;
}

export interface MinecraftCommand {
  name: string;
  aliases: string[];
  execute: (bot: MineflayerBot, username: string) => void;
}

export interface MineflayerBot {
  bot: Bot;
  commands: Collection<string, MinecraftCommand>;
  eventBridge: EventBridge;
  parkourStart: Location;

  teleportPlayer: (username: string, location: Location) => void;
}

export interface Location {
  x: number;
  y: number;
  z: number;
}