import { ClientEvents } from 'discord.js';
import { DiscordClient } from '@customTypes';
import { options } from '../config';
import { createEventHandler } from '../../utils/utils';

const eventHandler = createEventHandler<ClientEvents>()({
  event: 'messageCreate',
  handle(message) {
    if (message.channelId !== options.chatChannelId || message.author.bot) return;
    const client = message.client as DiscordClient;
    client.eventBridge.emit('discordMessage', message.content);
  },
});

export = eventHandler;
