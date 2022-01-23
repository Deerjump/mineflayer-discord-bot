import { MinecraftBotOptions } from '@customTypes';
import { HYPIXEL } from '../utils/constants';

export const options: MinecraftBotOptions = {
  // Mineflayer options
  username: process.env.MINECRAFT_USERNAME!,
  password: process.env.MINECRAFT_PASSWORD!,
  auth: 'microsoft',
  host: HYPIXEL,
  version: '1.17.1',
  logErrors: true,

  // custom options
  prefix: '!',
  parkourTimeBanThreshold: 4,
  parkourStart: {
    x: 39.5,
    y: 97.5,
    z: -29
  },
  housingOwner: 'bunabii'
};
