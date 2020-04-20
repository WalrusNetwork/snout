/**
 * Snout - Private game server manager through Discord
 * @author Indicado
 */

import { Discord, On, Client, Guard, Prefix } from "@typeit/discord";

import { Collection, Message } from "discord.js";
import * as fs from "fs";

@Discord
export class Snout {
  static client: Client & {
    commands?: Collection<
      string,
      { name: string; description: string; execute: Function }
    >;
    cooldown?: Set<String>;
  };

  static start() {
    this.client = new Client();
    this.client.login(process.env.DISCORD_TOKEN);
    this.client.commands = new Collection();
    this.client.cooldown = new Set();

    fs.readdir(__dirname + "/commands", (error, filenames) => {
      if (error)
        throw new Error(
          "An error has occurred while trying to implement commands: " + error
        );
      filenames.filter((file) => file.endsWith(".ts"));

      for (const file of filenames) {
        const command = require(__dirname + `/commands/${file}`).default;
        this.client.commands.set(command.name, command);
      }
    });
  }

  @On("ready")
  onReady() {
    return console.log("Ready!");
  }

  @On("message")
  @Guard(Prefix(process.env.PREFIX))
  async onMessage(message: Message) {
    if (message.author.bot) return;
    if (message.content.indexOf(process.env.PREFIX) !== -1) return;

    const args = message.content.slice(0).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!Snout.client.commands.has(command)) return;

    if (Snout.client.cooldown.has(message.author.id))
      return message.channel.send("Slow down chief! You're going too fast.");

    try {
      Snout.client.commands.get(command).execute(message, args);

      // Cooldown
      Snout.client.cooldown.add(message.author.id);
      setTimeout(() => {
        Snout.client.cooldown.delete(message.author.id);
      }, 10000);
    } catch (error) {
      message.reply(
        "An error has occurred while trying to execute a command. Please try again later"
      );
      throw new Error(
        "An error has occurred while trying to execute a command: " + error
      );
    }
  }
}

Snout.start();
