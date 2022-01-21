import { MinecraftCommand } from '@customTypes';

export const command: MinecraftCommand = {
  name: 'skip',
  aliases: [],
  execute: ({ eventBridge }, username) => {
    console.log(`skip`, username);
    eventBridge.emit('skipRequestCommand', username);
  },
};

