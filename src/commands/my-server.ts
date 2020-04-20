/**
 * Creates a private game server instance
 * @author Indicado
 */

import { Message, MessageEmbed, Role } from "discord.js";
import fetch from "node-fetch";

import GraphQL from "../initializers/graphql";
import gql from "graphql-tag";

import Redis, { getAsync, getLrange } from "../initializers/redis";

const mutation = gql`
  mutation($username: String!, $uuid: String!, $regionCode: String!) {
    createServer(
      details: { username: $username, uuid: $uuid }
      regionCode: $regionCode
    ) {
      success
      location
      serverId
    }
  }
`;

const SERVER_READY_SUBSCRIPTION = gql`
  subscription($id: Int!) {
    serverReady(id: $id) {
      id
      name
      ip
    }
  }
`;

const SERVER_CLOSED_SUBSCRIPTION = gql`
  subscription($id: Int!) {
    serverClosed(id: $id) {
      id
      name
      ip
    }
  }
`;

export default {
  name: "my-server",
  description: "Requests a private game server",
  async execute(message: Message, args: Array<String>) {
    let guild = await getLrange("guild:" + message.guild.id, "0", "-1");
    if (!guild) guild = [];

    if (
      !message.member.hasPermission("ADMINISTRATOR") &&
      !message.member.roles.cache.some((role: Role) => guild.includes(role.id))
    )
      return message.reply("you don't have permission to run this command!");

    const server = await getAsync("user:" + message.author.id);
    if (server !== null)
      return message.reply(
        `you've already got a server up for ${
          server.username
        }! Join @ ${server.username.toLowerCase()}.walrus.gg. If you want to change your server's region, stop it with \`${
          process.env.PREFIX
        }stop\` and request a new one.`
      );

    if (args.length <= 0)
      return message.channel.send(
        "You haven't specified a username nor a region. Please try again"
      );

    let regionCode: String;
    let username: string;
    let uuid: string;

    const mojang = await (
      await fetch("https://api.ashcon.app/mojang/v2/user/" + args[0])
    ).json();

    if (mojang.error)
      return message.channel.send(
        "Something wrong has happened. Please provide a valid username next time!"
      );

    username = mojang.username;
    uuid = mojang.uuid;

    switch (args[1].toLowerCase()) {
      case "us-west":
        regionCode = "LAX";
        break;

      case "eu":
        regionCode = "CDG";
        break;

      case "jp":
        regionCode = "NAR";
        break;

      case "au":
        regionCode = "SYD";
        break;

      case undefined:
      case "us-east":
        regionCode = "EWR";
        break;

      default:
        regionCode = args[1];
    }

    const response: any = await GraphQL.mutate({
      variables: { username, uuid, regionCode },
      mutation,
    }).catch(() =>
      message.channel.send(
        `Something wrong has happened. Please, try again with a location listed in \`${process.env.PREFIX}locations\`.`
      )
    );

    if (response && !response.errors) {
      const data: { success: Boolean; location: string; serverId: number } =
        response.data.createServer;

      if (!data.success)
        return message.channel.send(
          `Something wrong has happened. Please, try again with a location listed in \`${process.env.PREFIX}locations\`.`
        );

      Redis.hmset(
        "user:" + message.author.id,
        "username",
        username,
        "serverId",
        data.serverId
      );

      const embed = new MessageEmbed()
        .setColor("#313a57")
        .setThumbnail(`https://cravatar.eu/helmavatar/${username}/256.png`)
        .setTitle(`A server for \`${username}\` is on the way!`)
        .setDescription(
          `This server will be hosted in \`${data.location}\`.` + "\n\u200b"
        )
        .addField(
          "When is it going to be online?",
          `In approximately 5 minutes. If it doesn't come up, try running \`${process.env.PREFIX}stop\` and try again.`
        )
        .addField(
          "Not enough player slots for your purpose?",
          "Please contact a staff member and we will do something about it :P"
        )
        .addField("Status", "> Creating server...\n\u200b")
        .setTimestamp()
        .setFooter(
          "Walrus",
          "https://avatars0.githubusercontent.com/u/55859359?s=200&v=4"
        );

      const announcement = await message.channel.send(embed);
      serverReady({ message, announcement, embed, id: data.serverId });

      return announcement;
    }
  },
};

const serverReady = ({
  message,
  announcement,
  embed,
  id,
}: {
  message: Message;
  announcement: Message;
  embed: MessageEmbed;
  id: Number;
}) => {
  const subscription = GraphQL.subscribe({
    query: SERVER_READY_SUBSCRIPTION,
    variables: { id },
  }).subscribe({
    next(response: any) {
      const data: { id: number; name: string; ip: string } =
        response.data.serverReady;

      subscription.unsubscribe();
      serverClosed({ message, id });

      announcement.edit(
        embed.spliceFields(2, 1, { name: "Status", value: "> Ready!\n\u200b" })
      );

      return message.reply(
        `your server is up! Join @ ${data.name}.walrus.gg \`(${data.ip})\``
      );
    },
    error() {
      return message.channel.send(
        `Something wrong has happened. Please, stop your server and try again with a location listed in \`${process.env.PREFIX}locations\`.`
      );
    },
  });
};

const serverClosed = ({ message, id }: { message: Message; id: Number }) => {
  const subscription = GraphQL.subscribe({
    query: SERVER_CLOSED_SUBSCRIPTION,
    variables: { id },
  }).subscribe({
    next() {
      subscription.unsubscribe();
      Redis.del("user:" + message.author.id);
    },
    error() {
      subscription.unsubscribe();
      Redis.del("user:" + message.author.id);
    },
  });
};
