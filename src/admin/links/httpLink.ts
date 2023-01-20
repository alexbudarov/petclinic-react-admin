import { createHttpLink } from "@apollo/client";

export const GRAPHQL_URI = import.meta.env.VITE_GRAPHQL_URI ?? "/graphql";
export const REQUEST_SAME_ORIGIN =
    import.meta.env.VITE_REQUEST_SAME_ORIGIN ?? true;

export const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
  credentials: REQUEST_SAME_ORIGIN ? "same-origin" : "include"
});
