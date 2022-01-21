import { Intents } from 'discord.js';
import { DiscordBotOptions } from '@customTypes';

export const options: DiscordBotOptions = {
  intents: new Intents(['GUILDS', 'GUILD_MESSAGES']),
  chatChannelId: '925551422949433374',
  skipChannelId: '928915822209019914',
  loggingChannelId: '929299105459613716',
  staffRoleId: '932470542051704832'
};
