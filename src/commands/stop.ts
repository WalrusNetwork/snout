/**
 * Stops the requester's private game server
 * @author Indicado
 */

import { Message } from "discord.js";

import GraphQL from "../initializers/graphql";
import gql from "graphql-tag";

import Redis, { getAsync } from "../initializers/redis";

const mutation = gql`
  mutation($id: Int!) {
    destroyServer(id: $id)
  }
`;

export default {
  name: "stop",
  description: "Stops the requester's private game server",
  async execute(message: Message) {
    const server = await getAsync("user:" + message.author.id);
    if (!server) return message.reply(`your server is not up!`);

    const response: any = await GraphQL.mutate({
      variables: { id: Number(server.serverId) },
      mutation,
    }).catch(() =>
      message.channel.send(
        "Something wrong has happened. Please try again later."
      )
    );

    if (response && !response.errors) {
      const confirmation: Boolean = response.data.destroyServer;

      if (!confirmation)
        return message.channel.send(
          "Something wrong has happened. Requested server is unavailable at the moment or doesn't exist. If created recently, please try again later."
        );
      Redis.del("user:" + message.author.id);
      return message.reply("done! You can open a server again if you want to.");
    }
  },
};
