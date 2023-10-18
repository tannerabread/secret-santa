const { gql } = require('apollo-server-micro');

const typeDefs = gql`
  type User {
    name: String!
    coupleId: Int!
    partnerId: ID
    hasChosen: Boolean!
    hasBeenChosen: Boolean!
    choseeName: String
  }

  type Query {
    allUsers: [User!]!
    userByName(name: String!): User
  }

  type Mutation {
    createUser(name: String!, coupleId: Int!): User!
    updateUserChoice(name: String!, choseeName: String!): User!
    resetChoices: Boolean!
  }
`;

module.exports = typeDefs;
