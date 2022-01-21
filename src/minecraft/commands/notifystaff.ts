import { MinecraftCommand } from "@customTypes";

export const command: MinecraftCommand = {
  name: 'notifystaff',
  aliases: [],
  execute: (minecraftBot, username) => {
    const { eventBridge } = minecraftBot;
    eventBridge.emit('notifyStaff', username);
  },
};