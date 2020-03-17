import { ApolloClient } from "apollo-client";
import withApollo from "next-with-apollo";

import { ApolloLink, concat, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { WebSocketLink } from "apollo-link-ws";
import { createUploadLink } from "apollo-upload-client";
import { getMainDefinition } from "apollo-utilities";

const SERVER = "http://localhost:4000/graphql";
const WEB_SOCKET_LINK = "ws://localhost:4000/graphql";

let authToken = null;

const httpLink = new HttpLink({
  fetch,
  uri: SERVER
});

const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      authorization: authToken || null
    }
  });

  return forward(operation);
});

const webSocketLink = process.browser
  ? new WebSocketLink({
      uri: WEB_SOCKET_LINK,
      options: {
        reconnect: true
      }
    })
  : null;

const uploadLink = process.browser
  ? new createUploadLink({
      uri: SERVER,
      headers: {
        "keep-alive": "true"
      }
    })
  : null;

export const setToken = async token => {
  try {
    authToken = token ? `Bearer ${token}` : null;
    Cookies.set("token", authToken, { expires: 7 });
  } catch (error) {
    console.log(error);
  }
};

export const setTokenInRequest = async token => {
  try {
    authToken = token ? token : null;
    return authToken;
  } catch (error) {
    console.log(error);
  }
};

export const destroyToken = async () => {
  try {
    Cookies.remove("token");
    authToken = null;
  } catch (error) {
    console.log(error);
  }
};

const link = process.browser
  ? split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === "OperationDefinition" && operation === "subscription";
      },
      webSocketLink,
      uploadLink,
      httpLink
    )
  : httpLink;

export default withApollo(
  ({ initialState }) =>
    new ApolloClient({
      link: concat(authMiddleware, link),

      cache: new InMemoryCache().restore(initialState || {})
    })
);
