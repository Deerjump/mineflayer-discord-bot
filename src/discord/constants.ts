import { MessageButton } from 'discord.js';

export const SKIP_ACCEPT_ID = 'skip-accept';
export const SKIP_CONFIRM_ID = 'skip-confirm';
export const SKIP_DECLINE_ID = 'skip-decline';

export const SKIP_ACCEPT_BUTTON = new MessageButton({
  customId: SKIP_ACCEPT_ID,
  style: 'PRIMARY',
  label: 'Accept',
});

export const SKIP_DECLINE_BUTTON = new MessageButton({
  customId: SKIP_DECLINE_ID,
  style: 'DANGER',
  label: 'Decline',
});

export const SKIP_CONFIRM_BUTTON = new MessageButton({
  customId: SKIP_CONFIRM_ID,
  style: 'PRIMARY',
  label: 'Confirm',
});
