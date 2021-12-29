import { DiscordBot, DiscordEventHandler } from "../../types";

const eventHandler: DiscordEventHandler = {
  event: "ready",
  once: true,
  handle(client: DiscordBot) {
    console.log(`${client.user?.username} is ready!`);
  },
};

export = eventHandler;
