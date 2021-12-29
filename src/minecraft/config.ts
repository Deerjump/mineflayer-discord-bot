import { BotOptions } from 'mineflayer'

export const options: BotOptions = {
  username: process.env.MINECRAFT_USERNAME!,
  password: process.env.MINECRAFT_PASSWORD!,
  auth: 'microsoft',
  version: '1.17'
};