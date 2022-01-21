import { MinecraftCommand } from '@customTypes';

export const command: MinecraftCommand = {
  name: 'restart',
  aliases: [],
  execute: (minecraftBot, username) => {
    console.log(`restart`, username);
    // teleport player to start
    minecraftBot.teleportPlayer(username, minecraftBot.parkourStart);
    // reset player's skips (Future feature)
  },
};
