import { MinecraftCommand } from '@customTypes';

import { MineflayerBot } from '../bot';

export const command: MinecraftCommand = {
  name: 'skip',
  aliases: [],
  execute: (bot: MineflayerBot, username: string) => {
    console.log(`skip`, username);
    bot.eventBridge.emit('skipRequest', username);
  },
};

