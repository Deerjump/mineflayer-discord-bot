import { ClientEvents, Message, MessageMentions } from 'discord.js';
const { USERS_PATTERN, CHANNELS_PATTERN, ROLES_PATTERN, EVERYONE_PATTERN } = MessageMentions;
import { DiscordClient } from '@customTypes';
import { options } from '../config';
import { createEventHandler } from '../../utils/utils';

function shouldIgnore(message: Message): boolean {
  const hasMention = [USERS_PATTERN, CHANNELS_PATTERN, ROLES_PATTERN, EVERYONE_PATTERN].some(
    (pattern) => message.content.match(pattern)
  );
  const isReply = message.type === 'REPLY';

  return hasMention || isReply;
}

const eventHandler = createEventHandler<ClientEvents>()({
  event: 'messageCreate',
  handle(message) {
    if (message.channelId !== options.chatChannelId || message.author.bot) return;
    if (shouldIgnore(message)) return;
    
    const client = message.client as DiscordClient;
    const content = `${message.author.username}: ${message.content}`;
    client.eventBridge.emit('discordMessage', content);
  },
});

export = eventHandler;
