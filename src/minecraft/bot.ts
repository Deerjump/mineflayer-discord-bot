import { createBot, Bot, BotEvents } from 'mineflayer';
import { extractRole, extractTime, wait } from '../utils/utils';
import {
  EventBridge,
  Location,
  MinecraftBotOptions,
  MinecraftCommand,
  MineflayerBot,
  Predicate,
} from '@customTypes';
import { FIVE_SECONDS, HYPIXEL, TWO_SECONDS } from '../utils/constants';
import fs from 'fs';
import { Collection } from 'discord.js';
import {
  ALREADY_CONNECTED,
  TRY_AGAIN,
  FULL_HOUSE,
  HOUSING_ACTION_BAR,
  BAN_COMMAND,
} from './constants';

export class MinecraftBot implements MineflayerBot {
  readonly commands = new Collection<string, MinecraftCommand>();
  readonly eventBridge: EventBridge;
  bot: Bot;
  parkourStart: Location;
  private prefix: string;
  private parkourTimeBanThreshold: number;
  private options: MinecraftBotOptions;

  constructor(options: MinecraftBotOptions, eventBridge: EventBridge) {
    this.options = options;
    this.prefix = options.prefix;
    this.parkourStart = options.parkourStart;
    this.parkourTimeBanThreshold = options.parkourTimeBanThreshold;
    this.eventBridge = eventBridge;
    this.loadCommands();
    this.bot = this.initializeBot(options);
  }

  private initializeBot(options: MinecraftBotOptions) {
    const bot = createBot(options);
    bot.on('error', (error) => console.error(`Error:`, error));
    bot.on('end', async (reason) => {
      console.log(`End:`, reason);
      console.log('Attempting to reconnect!');
      await wait(FIVE_SECONDS);
      this.bot = this.initializeBot(options);
    });

    bot.once('login', () => {
      console.log(`[Minecraft]: Logged in to "${options.host}" as ${this.bot.username}!`);
    });

    // bot.on('messagestr', (message, position) => {
    //   if (position != 'chat') return;
    //   console.log(position, message);
    // });

    if (options.host === HYPIXEL) {
      bot.once('spawn', async () => {
        await bot.waitForChunksToLoad();
        await this.goToHousing();
        this.startChatListeners();
        this.startCompletionTimeListener();
      });
    }

    return bot;
  }

  private startChatListeners() {
    // minecraft -> discord
    this.bot.on('chat', (username, message, _, json) => {
      if (username === this.bot.username || username === 'playing') return;
      this.getCommand(message)?.execute(this, username);

      const role = extractRole(json.json.text)?.replace(' ', '');
      if (role == undefined) return;
      const formatted = `\`${role}\` **${username}**: ${message}`;
      this.eventBridge.emit('minecraftMessage', formatted);
    });

    // discord -> minecraft
    this.eventBridge.on('discordMessage', (message) => {
      this.bot.chat(message);
    });
  }

  private startCompletionTimeListener() {
    this.bot.on('messagestr', (message, position) => {
      if (position != 'chat') return;
      const regex = /^([a-zA-Z0-_]*) completed the parkour in (.*)!/;
      const [match, name, time] = message.match(regex) ?? [];
      if (!match) return;
      const [minutes] = extractTime(time);
      if (minutes < this.parkourTimeBanThreshold) {
        console.log(`${name} was banned for hacking parkour.`, `Completion Time: ${time}`);
        this.ban(name, 'Hacking');
      }
    });
  }

  private async loadCommands() {
    console.log('Loading MinecraftBot commands...');
    const imports = await Promise.all(
      fs
        .readdirSync(`${__dirname}/commands/`)
        .filter((file) => file.endsWith('.js'))
        .map(async (file) => {
          try {
            return await import(`./commands/${file}`);
          } catch (error) {
            console.error(`Error loading ${file}`);
            console.error(error);
          }
        })
    );

    const commands = imports
      .filter((imported) => imported != undefined)
      .map(({ command }) => command);

    console.log(`Loaded ${commands.length} MinecraftBot commands`);
    commands.forEach((command) => {
      this.commands.set(command.name, command);
    });
  }

  private ban(username: string, reason: string) {
    this.bot.chat(`${BAN_COMMAND} ${username}`);
    console.log(`${username} has been banned. Reason: ${reason}`);
  }

  private getCommand(message: string) {
    if (!message.startsWith(this.prefix)) return;
    const args = message.slice(this.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase()!;

    const command =
      this.commands.get(commandName) ||
      this.commands.find((cmd) => cmd.aliases?.includes(commandName));

    return command;
  }

  private async goToHousingLobby() {
    console.log('Going to housing lobby');
    this.bot.chat('/lobby housing');

    await Promise.race([
      this.waitForEvent('spawn'),
      this.waitForEventWhen('messagestr', (message, position) => {
        return position === 'chat' && message === ALREADY_CONNECTED;
      }),
    ]);
    console.log('In housing lobby');
  }

  private async visitHousingServer(name: string) {
    console.log(`Visiting ${name}'s house`);
    this.bot.chat(`/visit ${name}`);

    return new Promise<void>((resolve) => {
      this.bot.once('windowOpen', async (window) => {
        const expectedTitle = `${this.options.housingOwner}\\u0027s Houses`.toLowerCase();
        if (!window.title.toLowerCase().includes(expectedTitle)) return;
        const item = window.containerItems().find((item) => item != null);
        window.requiresConfirmation = false;
        if (item == null) {
          throw new Error(`Problem visiting ${name}`);
        }
        await this.bot.clickWindow(item.slot, 0, 0);

        const handler = async (message: string, position: string) => {
          switch (position) {
            case 'chat': {
              if (!message.includes(TRY_AGAIN) && !message.includes(FULL_HOUSE)) return;
              // send warning to discord
              this.eventBridge.emit('connectionFailure', message);
              await wait(FIVE_SECONDS);
              this.visitHousingServer(name);
              break;
            }
            case 'game_info': {
              if (!message.includes(HOUSING_ACTION_BAR)) return;
              console.log('Successfully arrived at housing server');
              this.teleport(this.options.whereToStand);
              resolve();
              break;
            }
            default:
              return;
          }
          this.bot.removeListener('messagestr', handler);
        };

        this.bot.on('messagestr', handler);
      });
    });
  }

  private waitForEvent<K extends keyof BotEvents>(eventName: K) {
    return new Promise<Parameters<BotEvents[K]>>(
      // @ts-ignore
      (resolve) => this.bot.once(eventName, resolve)
    );
  }

  private waitForEventWhen<K extends keyof BotEvents>(
    eventName: K,
    test: Predicate<Parameters<BotEvents[K]>>
  ) {
    return new Promise<Parameters<BotEvents[K]>>((resolve) => {
      const handler = (...args: Parameters<BotEvents[K]>) => {
        if (test(...args)) {
          // @ts-ignore
          this.bot.removeListener(eventName, handler);
          resolve(args);
        }
      };

      // @ts-ignore
      this.bot.on(eventName, handler);
    });
  }

  private async goToHousing() {
    await wait(TWO_SECONDS);
    await this.goToHousingLobby();
    await wait(TWO_SECONDS);
    this.visitHousingServer(this.options.housingOwner);
  }

  teleport({x, y, z}: Location) {
    console.log(`Teleporting to ${x} ${y} ${z}`);
    this.bot.chat(`/tp ${x} ${y} ${z}`);
  }

  teleportPlayer(username: string, { x, y, z }: Location) {
    this.bot.chat(`/tp ${username} ${x} ${y} ${z}`);
  }
}
