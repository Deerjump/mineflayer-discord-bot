import { createBot, Bot, BotOptions, BotEvents } from 'mineflayer';
import { extractRole, wait } from '../utils/utils';
import { EventBridge, MinecraftCommand, Predicate } from '@customTypes';
import { FIVE_SECONDS, HYPIXEL, TWO_SECONDS } from '../utils/constants';
import fs from 'fs';
import { Collection } from 'discord.js';
import {
  ALREADY_CONNECTED,
  HOUSING_TITLE,
  TRY_AGAIN,
  FULL_HOUSE,
  HOUSING_ACTION_BAR,
  WHISPER_COMMAND,
} from './constants';

export class MineflayerBot {
  public bot: Bot;
  public eventBridge: EventBridge;
  readonly commands = new Collection<string, MinecraftCommand>();
  private prefix: string;

  constructor(options: BotOptions, eventBridge: EventBridge) {
    this.prefix = '!';
    this.eventBridge = eventBridge;
    this.bot = createBot(options);

    this.loadCommands();
    this.bot.on('error', (error) => console.error(`Error:`, error));
    this.bot.on('end', (reason) => console.log(`End:`, reason));

    // TODO: check if login failed

    this.bot.once('login', () => {
      console.log(`[Minecraft]: Logged in to "${options.host}" as ${this.bot.username}!`);
    });

    this.bot.on('messagestr', (message, position) => {
      console.log(position, message);
    });

    if (options.host === HYPIXEL) {
      this.bot.once('spawn', async () => {
        await this.bot.waitForChunksToLoad();
        await this.goToHousing();
        this.startChatListeners();
        this.startSkipListeners();
      });
    }
  }

  private startChatListeners() {
    // minecraft -> discord
    this.bot.on('chat', (username, message, _, json) => {
      if (username === this.bot.username || username === 'playing') return;
      this.getCommand(message)?.execute(this, username);

      const role = extractRole(json.json.text)?.replace(' ', '');
      const formatted = `\`${role}\` **${username}**: ${message}`;
      this.eventBridge.emit('minecraftMessage', formatted);
    });

    // discord -> minecraft
    this.eventBridge.on('discordMessage', (message) => {
      console.log(`[Minecraft]: ${message}`);
      this.getCommand(message)?.execute(this, this.bot.username);
      // this.bot.chat(message);
    });
  }

  private startSkipListeners() {
    this.eventBridge.on('skipRequestCreate', (username) => {
      const player = this.bot.players[username];
      if (player == null) return;
      const response = 'Your request has been created and will be handled shortly';
      const message = `${WHISPER_COMMAND} ${username} ${response}`;
      console.log(message);
      // this.bot.chat(message);
    });

    this.eventBridge.on('skipRequestCancelled', ({ requester, handledBy }) => {
      const player = this.bot.players[requester];
      if (player == null) return;
      const response = `Your skip was cancelled by ${handledBy}`;
      const message = `${WHISPER_COMMAND} ${requester} ${response}`;
      console.log(message);
      // this.bot.chat(message);
    });

    this.eventBridge.on('skipRequestApproved', ({ requester, handledBy }) => {
      const player = this.bot.players[requester];
      if (player == null) return;
      const response = `Your skip was approved by ${handledBy}`;
      const message = `${WHISPER_COMMAND} ${requester} ${response}`;
      console.log(message);
      // this.bot.chat(message);
    });

    this.eventBridge.on('skipRequestDenied', ({ requester, handledBy }) => {
      const player = this.bot.players[requester];
      if (player == null) return;
      const response = `Your skip was denied by ${handledBy}`;
      const message = `${WHISPER_COMMAND} ${requester} ${response}`;
      console.log(message);
      // this.bot.chat(message);
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

  private getCommand(message: string): MinecraftCommand | undefined {
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
  }

  private async visitHousingServer(name: string) {
    this.bot.chat(`/visit ${name}`);

    return new Promise<void>((resolve) => {
      this.bot.once('windowOpen', async (window) => {
        if (!window.title.includes(HOUSING_TITLE)) return;
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
              resolve();
              break;
            }
            default:
              return;
          }
          this.bot.removeListener('messagestr', handler);
        };

        const failureHandler = async (message: string, position: string) => {
          if (position !== 'chat') return;
          if (!message.includes(TRY_AGAIN) && !message.includes(FULL_HOUSE)) return;

          // send warning to discord
          this.eventBridge.emit('connectionFailure', message);

          this.bot.removeListener('messagestr', failureHandler);
          this.bot.removeListener('messagestr', successHandler);
          await wait(FIVE_SECONDS);
          await this.visitHousingServer(name);
        };

        const successHandler = (message: string, position: string) => {
          if (position !== 'game_info') return;
          if (!message.includes(HOUSING_ACTION_BAR)) return;
          console.log('Successfully arrived at housing server');
          this.bot.removeListener('messagestr', failureHandler);
          this.bot.removeListener('messagestr', successHandler);
          resolve();
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
    console.log('In housing lobby');
    await wait(TWO_SECONDS);
    this.visitHousingServer('wuved');
  }
}
