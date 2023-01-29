import { ApolloLink } from "@apollo/client";
import {i18nProvider} from "../../i18nProvider";

export const localeLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      "accept-language": i18nProvider.getLocale(),
    },
  }));
  return forward(operation);
});
