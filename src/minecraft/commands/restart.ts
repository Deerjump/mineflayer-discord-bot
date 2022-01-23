import { MinecraftCommand } from '@customTypes';

export const command: MinecraftCommand = {
  name: 'restart',
  aliases: [],
  execute: (minecraftBot, username) => {
    minecraftBot.teleportPlayer(username, minecraftBot.parkourStart);
  },
};
