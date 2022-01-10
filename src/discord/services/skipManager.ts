import { DiscordClient } from '@customTypes';
import {
  ButtonInteraction,
  Collection,
  MessageActionRow,
  MessageEmbed,
  MessageOptions,
  User,
} from 'discord.js';
import {
  SKIP_ACCEPT_BUTTON,
  SKIP_ACCEPT_ID,
  SKIP_APPROVE_BUTTON,
  SKIP_APPROVE_ID,
  SKIP_CANCEL_BUTTON,
  SKIP_CANCEL_ID,
  SKIP_DECLINE_BUTTON,
  SKIP_DECLINE_ID,
} from '../constants';

export class SkipManager {
  private skipRequests = new Collection<string, SkipRequest>();

  constructor(private client: DiscordClient) {
    this.client.eventBridge.on('skipRequest', this.createSkipRequest.bind(this));
    this.client.eventBridge.on('skipRequestCancel', this.cancelSkipRequest.bind(this));
    this.startButtonListener();
  }

  startButtonListener() {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;
      if (interaction.channelId != this.client.config.skipChannelId) return;
      await interaction.deferUpdate();
      
      const { user } = interaction;
      const requester = interaction.message.embeds[0].author!.name;
      const request = this.skipRequests.get(requester);

      if (request == null) {
        await interaction.deleteReply();
        return;
      }

      const accepter = request.acceptedBy;

      if (accepter && user.id !== accepter.id) {
        await interaction.followUp({
          ephemeral: true,
          content: 'You cannot interact with a request you did not accept!',
        });
        return;
      }

      switch ((interaction as ButtonInteraction).customId) {
        case SKIP_ACCEPT_ID:
          request.accept(user);
          await interaction.editReply(request.toDiscordMessage());
          return;
        case SKIP_APPROVE_ID:
          this.logSkipResult(requester, `Approved by: ${accepter?.username}`);
          break;
        case SKIP_CANCEL_ID:
          this.logSkipResult(requester, `Canceled by: ${accepter?.username}`);
          break;
        case SKIP_DECLINE_ID:
          this.logSkipResult(requester, `Denied by: ${accepter?.username}`);
          break;
      }
      this.skipRequests.delete(requester);
      await interaction.deleteReply();
    });
  }

  private async logSkipResult(skipper: string, result: string) {
    const logChannel = this.client.getLogChannel();
    const embed = new MessageEmbed().setAuthor(skipper).setDescription(result);
    await logChannel.send({ embeds: [embed] });
  }

  async createSkipRequest(username: string) {
    if (this.skipRequests.has(username)) {
      //TODO message user that they have an active skip request
      return;
    }
    const request = new SkipRequest(username);
    this.skipRequests.set(username, request);
    //TODO message user that it worked and is pending

    const message = request.toDiscordMessage();
    const channel = await this.client.getSkipChannel();
    const sentMessage = await channel.send(message);
    request.messageId = sentMessage.id;
  }

  async cancelSkipRequest(username: string) {
    const request = this.skipRequests.get(username);
    if (request == null) {
      //TODO error message of no active skip
      return;
    }

    if (request.messageId == null) {
      console.error(`ERROR: Request for ${request.username} has no messageId!`);
      return;
    }

    const skipChannel = this.client.getSkipChannel();
    const message = await skipChannel.messages.fetch(request.messageId);
    await message.delete();
    this.skipRequests.delete(request.username);
  }
}

export class SkipRequest {
  acceptedBy?: User;
  messageId?: string;

  constructor(readonly username: string) {}

  toDiscordMessage(): MessageOptions {
    const embed = new MessageEmbed().setAuthor(this.username);
    let components = [];

    if (!this.acceptedBy) {
      embed.setDescription('wants to skip!');
      components.push(new MessageActionRow().setComponents(SKIP_ACCEPT_BUTTON));
      return { embeds: [embed], components };
    }

    embed.setDescription(`Accepted by: **${this.acceptedBy?.username}**`);
    components.push(
      new MessageActionRow().setComponents(
        SKIP_APPROVE_BUTTON,
        SKIP_DECLINE_BUTTON,
        SKIP_CANCEL_BUTTON
      )
    );
    return { embeds: [embed], components };
  }

  accept(user: User) {
    if (this.acceptedBy) return;
    this.acceptedBy = user;
  }
}
