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
  SKIP_DECLINE_BUTTON,
  SKIP_DECLINE_ID,
  SKIP_CONFIRM_ID,
  SKIP_CONFIRM_BUTTON,
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
        case SKIP_CONFIRM_ID:
          this.approveSkipRequest(request);
          break;
        case SKIP_DECLINE_ID:
          this.declineSkipRequest(request);
          break;
      }
      this.skipRequests.delete(requester);
      await interaction.deleteReply();
    });
  }

  private async createSkipRequest(username: string) {
    if (this.skipRequests.has(username)) {
      return;
    }

    const request = new SkipRequest(username);
    this.skipRequests.set(username, request);

    await this.client.getSkipChannel().send(request.toDiscordMessage());
  }

  private async approveSkipRequest({ username, acceptedBy }: SkipRequest) {
    const embed = new MessageEmbed()
      .setAuthor({ name: username })
      .setColor('DARK_AQUA')
      .setDescription(`Confirmed by: ${acceptedBy}`);

    await this.client.getLogChannel().send({ embeds: [embed] });
  }

  private async declineSkipRequest({ username, acceptedBy }: SkipRequest) {
    const embed = new MessageEmbed()
      .setAuthor({ name: username })
      .setColor('RED')
      .setDescription(`Declined by: ${acceptedBy}`);

    await this.client.getLogChannel().send({ embeds: [embed] });
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

    embed.setDescription(`Accepted by: **${this.acceptedBy}**`);
    const row = new MessageActionRow().setComponents(SKIP_CONFIRM_BUTTON, SKIP_DECLINE_BUTTON);
    components.push(row);

    return { embeds: [embed], components: [row] };
  }

  accept(user: User) {
    this.acceptedBy = user;
  }
}
