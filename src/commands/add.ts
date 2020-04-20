/**
 * Lets users with a role invoke private game servers
 * @author Indicado
 */

import { Message, Role } from "discord.js";
import Redis, { getLrange } from "../initializers/redis";

export default {
  name: "add",
  description:
    "Adds a role to a permitted roles list that lets its users invoke private game servers",
  async execute(message: Message, args: Array<String>) {
    if (!message.member.hasPermission("ADMINISTRATOR"))
      return message.channel.send(
        "Uh oh! You have to be an administrator on this Discord server to be able to do that."
      );
    if (args.length <= 0)
      return message.channel.send(
        "You haven't specified a username nor a region. Please try again"
      );

    let guild = await getLrange("guild:" + message.guild.id, "0", "-1");
    if (!guild) guild = [];

    const role = message.guild.roles.cache.find(
      (role: Role) => role.name === args[0]
    );
    if (!role)
      return message.channel.send(
        "Uh oh! That role doesn't exist. Please try again."
      );

    if (guild.includes(role.id))
      return message.channel.send("You have already added that role!");

    Redis.lpush("guild:" + message.guild.id, role.id);
    return message.channel.send(`Done! Added role ${args[0]}.`);
  },
};
