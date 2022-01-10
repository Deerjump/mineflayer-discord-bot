import { BotOptions } from 'mineflayer';
import { HYPIXEL } from '../utils/constants';

export const options: BotOptions = {
  username: process.env.MINECRAFT_USERNAME!,
  password: process.env.MINECRAFT_PASSWORD!,
  auth: 'microsoft',
  host: HYPIXEL,
  version: '1.17.1',
  logErrors: true,
};
