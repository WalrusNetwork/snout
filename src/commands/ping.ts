/**
 * Do I need to explain myself?
 * @author Indicado
 */

import { Message } from "discord.js";

export default {
  name: "ping",
  description: "Ping!",
  async execute(message: Message) {
    message.channel.send("Pong!");
  },
};
