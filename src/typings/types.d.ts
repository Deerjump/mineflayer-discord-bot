import { Awaitable, Client, ClientEvents, Intents, TextBasedChannel, User } from 'discord.js';
import { BotEvents } from 'mineflayer';
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
}

type EventBridge = TypedEmitter<CustomEvents>;

type InferParams<T> = T extends unknown[]
  ? T
  : T extends (...args: never) => unknown
  ? Parameters<T>
  : never;

type Callback<T, R> = (...args: T) => R;
type Predicate<T> = Callback<T, boolean>;

interface EventHandler<T, K extends keyof T = keyof T> {
  event: K;
  once?: boolean;
  handle: (...args: InferParams<T[K]>) => void;
}

interface CustomEvents {
  discordMessage: (message: string) => void;
  minecraftMessage: (message: string) => void;
  connectionFailure: (reason: string) => void;
  skipRequestCommand: (username: string) => void;
  skipRequestFail: (username: string, reason: string) => void;
  skipRequestCreate: (username: string) => void;
  skipRequestCancelled: (skipInteraction: SkipInteraction) => void;
  skipRequestApproved: (skipInteraction: SkipInteraction) => void;
  skipRequestDenied: (skipInteraction: SkipInteraction) => void;
}

interface SkipInteraction {
  requester: string;
  handledBy: string;
}

interface MinecraftCommand {
  name: string;
  aliases: string[];
  execute: (bot: Bot, username: string) => void;
}
