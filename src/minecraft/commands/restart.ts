import { MinecraftCommand } from '@customTypes';

import { MineflayerBot } from '../bot';

export const command: MinecraftCommand = {
  name: 'restart',
  aliases: [],
  execute: ({ bot }: MineflayerBot, username: string) => {
    console.log(`restart`, username);
    bot.chat(`/msg ${username} Restarting you!`);
    // TODO send the restart command
  },
};

