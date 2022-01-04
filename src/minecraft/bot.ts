import { createBot, Bot, BotOptions } from "mineflayer";
import { mineflayer } from "prismarine-viewer";
import { extractRole, wait } from "../utils/utils";
import { ChatEvents } from "@customTypes";
import TypedEmitter from "typed-emitter";

export class MineflayerBot {
  private minecraft: Bot;

  constructor(options: BotOptions, private eventBridge: TypedEmitter<ChatEvents>) {
    this.minecraft = createBot(options);
    this.startListeners();
    this.setupEventBridge();
  }

  private setupEventBridge() {
    this.eventBridge.on('discordMessage', (message) => {
      console.log(`[Minecraft]: ${message}`)
      this.minecraft.chat(message);
    })
  }

  private startListeners() {
    this.minecraft.once("login", async () => {
      console.log(`[Mineflayer]: Logged in as ${this.minecraft.username}!`);
      // start mineflayer for dev purposes
      await mineflayer(this.minecraft, { port: 3000, firstPerson: true })

    });
    this.minecraft.on("end", (why) => console.log(why));
    this.minecraft.on("chat", (username, message, _, json) => {
      console.log(json.json)
      const role = extractRole(json.json.text)?.replace(' ', '');
      this.eventBridge.emit('minecraftMessage', `\`${role}\` **${username}**: ${message}`);
    });

    this.minecraft.once("spawn", () => this.goToHousing());
  }

  private async goToHousing() {
    this.minecraft.once("windowOpen", (window) => {
      const item = window.containerItems().find(item => item != null);
      
      if (item == null) throw new Error("Problem visiting wuved")
      this.minecraft.clickWindow(item.slot, 0, 0);
    });
    this.minecraft.chat("/lobby housing");
    await wait(2000);
    this.minecraft.chat("/visit wuved");
    await wait(2000);
  }
}
