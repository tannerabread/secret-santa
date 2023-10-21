import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: '/api/graphql', // Your GraphQL endpoint
  headers: {
    authorization: `Bearer ${process.env.FAUNA_SECRET_KEY}`
  }
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

export default client;
