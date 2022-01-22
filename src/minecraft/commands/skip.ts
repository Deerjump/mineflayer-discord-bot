import { MinecraftCommand } from '@customTypes';

export const command: MinecraftCommand = {
  name: 'skip',
  aliases: [],
  execute: (minecraftBot, username) => {
    const { eventBridge } = minecraftBot
    eventBridge.emit('skipRequestCommand', username);
  },
};

