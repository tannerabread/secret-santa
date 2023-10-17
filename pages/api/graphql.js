const { ApolloServer } = require('apollo-server-micro');
const typeDefs = require('../../helpers/schema');
const resolvers = require('../../helpers/resolvers');
const cors = require('micro-cors')();

const apolloServer = new ApolloServer({ typeDefs, resolvers });

let isApolloServerStarted = false;

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  if (!isApolloServerStarted) {
    await apolloServer.start();
    isApolloServerStarted = true;
  }

  await apolloServer.createHandler({ path: '/api/graphql' })(req, res);
};

export default cors(handler);
