import { BotOptions } from 'mineflayer'

export const options: BotOptions = {
  username: process.env.MINECRAFT_USERNAME!,
  password: process.env.MINECRAFT_PASSWORD!,
  auth: 'microsoft',
  host: 'mc.hypixel.net',
  version: '1.17.1',
  logErrors: true,
};