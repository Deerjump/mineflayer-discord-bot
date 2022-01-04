import { MineflayerBot } from './minecraft/bot';
import * as discordConfig from './discord/config';
import * as mineflayerConfig from './minecraft/config';
import { ChatEvents, DiscordClient } from '@customTypes';
import TypedEmitter from 'typed-emitter';
import { DiscordBot } from './discord/bot';
import EventEmitter from 'events';
import { config } from 'dotenv';

config();

async function main() {
  const eventBridge = new EventEmitter() as TypedEmitter<ChatEvents>;
  const discordBot: DiscordClient = new DiscordBot(discordConfig.options, eventBridge);
  const minecraftBot = new MineflayerBot(mineflayerConfig.options, eventBridge);

  await discordBot.login(process.env.DISCORD_TOKEN!);
}

main();