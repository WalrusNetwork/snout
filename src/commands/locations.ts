/**
 * Lists available cloud locations
 * @author Indicado
 */

import { Message, MessageEmbed } from "discord.js";

import GraphQL from "../initializers/graphql";
import gql from "graphql-tag";

import * as emoji from "node-emoji";

const query = gql`
  query {
    serverLocations {
      name
      country
      regionCode
    }
  }
`;

export default {
  name: "locations",
  description: "Lists available cloud locations",
  async execute(message: Message) {
    const response: any = await GraphQL.query({ query }).catch(() =>
      message.channel.send(
        "Something wrong has happened. Please try again later"
      )
    );

    if (response && !response.errors) {
      const data: Array<Record<string, string | number>> =
        response.data.serverLocations;

      const embed = new MessageEmbed()
        .setColor("#313a57")
        .setAuthor(
          "Walrus",
          "https://avatars0.githubusercontent.com/u/55859359?s=200&v=4",
          "https://walrus.gg"
        )
        .addField(
          "The list goes beyond `us-east`, `us-west`, `eu`, `jp` or `au`. Available locations may include:",
          data
            .map(
              (location: any) =>
                `-** ${location.name}** ${emoji.emojify(
                  ":flag_" + location.country.toLowerCase()
                )}: (\`${location.regionCode}\`)`
            )
            .join("\n")
        );

      message.channel.send(embed);
    }
  }
};
