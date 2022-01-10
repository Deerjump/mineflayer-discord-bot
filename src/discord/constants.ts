import { MessageButton } from 'discord.js';

export const SKIP_ACCEPT_ID = 'skip-accept';
export const SKIP_APPROVE_ID = 'skip-approve';
export const SKIP_CANCEL_ID = 'skip-cancel';
export const SKIP_DECLINE_ID = 'skip-decline';

export const SKIP_ACCEPT_BUTTON = new MessageButton({
  customId: SKIP_ACCEPT_ID,
  style: 'PRIMARY',
  label: 'Accept',
});

export const SKIP_CANCEL_BUTTON = new MessageButton({
  customId: SKIP_CANCEL_ID,
  style: 'PRIMARY',
  label: 'Cancel',
});

export const SKIP_DECLINE_BUTTON = new MessageButton({
  customId: SKIP_DECLINE_ID,
  style: 'PRIMARY',
  label: 'Decline',
});

export const SKIP_APPROVE_BUTTON = new MessageButton({
  customId: SKIP_APPROVE_ID,
  style: 'PRIMARY',
  label: 'Approve',
});
