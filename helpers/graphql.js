import { GraphQLClient } from 'graphql-request'

// export instance of GraphQL Client for Fauna queries
export default new GraphQLClient('https://graphql.us.fauna.com/graphql', {
  headers: {
    Authorization: `Bearer ${process.env.FAUNA_SECRET_KEY}`,
  },
})
