import { getMinecraftBot } from './minecraft/bot';
import {options} from './discord/config';
import { Bot } from './discord/bot';
import { config } from 'dotenv';
config();

async function main() {
  const discordBot = new Bot(options);
  await discordBot.login(process.env.DISCORD_TOKEN!);
  const bot = await getMinecraftBot();
  bot.on('chat', (username, message, translate, json, matches) => {
    discordBot.send(`${username}: ${message}`);
  })
}

main();