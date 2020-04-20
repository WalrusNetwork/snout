/**
 * Apollo Client Initializer
 * @author Indicado
 */

import ApolloClient from "apollo-client";
import { createHttpLink } from "apollo-link-http";

import * as ws from "ws";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";

import fetch from "node-fetch";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";

const httpLink = createHttpLink({
  uri: `http://${process.env.API_URL}`,
  fetch: fetch,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${process.env.SERVER_TOKEN}`,
    },
  };
});

const wsLink = new WebSocketLink({
  uri: `ws://${process.env.API_URL}`,
  options: {
    reconnect: true,
  },
  webSocketImpl: ws,
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const GraphQL = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default GraphQL;
