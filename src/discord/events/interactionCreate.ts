import { ClientEvents } from 'discord.js';
import { createEventHandler } from '../../utils/utils';

const eventHandler = createEventHandler<ClientEvents>()({
  event: 'interactionCreate',
  handle(interaction) {
    return;
  },
});

export = eventHandler;
