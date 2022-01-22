import { MinecraftCommand } from '@customTypes';

export const command: MinecraftCommand = {
  name: 'restart',
  aliases: [],
  execute: (minecraftBot, username) => {
    console.log(`restart`, username);
    minecraftBot.teleportPlayer(username, minecraftBot.parkourStart);
  },
};
