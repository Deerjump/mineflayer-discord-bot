import { MinecraftCommand } from '@customTypes';

import { MineflayerBot } from '../bot';

export const command: MinecraftCommand = {
  name: 'skipcancel',
  aliases: [],
  execute: (bot: MineflayerBot, username: string) => {
    console.log(`skipcancel`, username);
    bot.eventBridge.emit('skipRequestCancel', username);
  },
};