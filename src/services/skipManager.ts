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
} from '../discord/constants';

export class SkipManager {
  private skipRequests = new Collection<string, SkipRequest>();

  constructor(private client: DiscordClient) {
    this.client.eventBridge.on('skipRequestCommand', this.createSkipRequest.bind(this));
    this.startButtonListener();
  }

  private startButtonListener() {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;
      if (interaction.channelId != this.client.getSkipChannel().id) return;
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
        case SKIP_CANCEL_ID:
          this.cancelSkipRequest(request);
          break;
        case SKIP_APPROVE_ID:
          this.approveSkipRequest(request);
          break;
        case SKIP_DECLINE_ID:
          this.denySkipRequest(request);
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

  private async createSkipRequest(username: string) {
    if (this.skipRequests.has(username)) {
      this.client.eventBridge.emit(
        'skipRequestFail',
        username,
        'An active skip request already exists!'
      );
      return;
    }

    const request = new SkipRequest(username);
    this.skipRequests.set(username, request);
    this.client.eventBridge.emit(
      'skipRequestCreate',
      username  
    );

    await this.client.getSkipChannel().send(request.toDiscordMessage());
  }

  private approveSkipRequest({ username, acceptedBy }: SkipRequest) {
    this.logSkipResult(username, `Approved by: ${acceptedBy?.username}`);
    this.client.eventBridge.emit('skipRequestApproved', {
      requester: username,
      handledBy: acceptedBy?.username!,
    });
  }

  private denySkipRequest({ username, acceptedBy }: SkipRequest) {
    this.logSkipResult(username, `Denied by: ${acceptedBy?.username}`);
    this.client.eventBridge.emit('skipRequestDenied', {
      requester: username,
      handledBy: acceptedBy?.username!,
    });
  }

  private async cancelSkipRequest({ username, acceptedBy }: SkipRequest) {
    this.logSkipResult(username, `Canceled by: ${acceptedBy?.username}`);
    this.client.eventBridge.emit('skipRequestCancelled', {
      requester: username,
      handledBy: acceptedBy?.username!,
    });
  }
}

export class SkipRequest {
  acceptedBy?: User;

  constructor(readonly username: string) {}

  toDiscordMessage(): MessageOptions {
    const embed = new MessageEmbed().setAuthor(this.username);
    let components = [];

    if (!this.acceptedBy) {
      embed.setDescription('wants to skip!');
      components.push(new MessageActionRow().setComponents(SKIP_ACCEPT_BUTTON));
      return { embeds: [embed], components };
    }

    embed.setDescription(`Accepted by: **${this.acceptedBy.username}**`);
    const row = new MessageActionRow().setComponents(
      SKIP_APPROVE_BUTTON,
      SKIP_DECLINE_BUTTON,
      SKIP_CANCEL_BUTTON
    );
    components.push(row);

    return { embeds: [embed], components: [row] };
  }

  accept(user: User) {
    this.acceptedBy = user;
  }
}
