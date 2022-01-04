import { DiscordClient, DiscordEventHandler } from "@customTypes";

const eventHandler: DiscordEventHandler = {
  event: "ready",
  once: true,
  handle(client: DiscordClient) {
    console.log(`[Discord]: ${client.user?.username} is ready!`);
  },
};

export = eventHandler;
