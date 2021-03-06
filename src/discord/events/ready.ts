import { ClientEvents } from 'discord.js';
import { createEventHandler } from '../../utils/utils';

const eventHandler = createEventHandler<ClientEvents>()({
  event: 'ready',
  handle(client) {
    console.log(`[Discord] ${client.user.username} is ready!`);
  },
});

export = eventHandler;
