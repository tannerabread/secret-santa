const { gql } = require('apollo-server-micro');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    coupleId: Int!
    partnerId: ID!
    hasChosen: Boolean!
    hasBeenChosen: Boolean!
    choseeId: ID
  }

  type Query {
    allUsers: [User!]!
    userById(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, coupleId: Int!, partnerId: ID!): User!
    updateUserChoice(userId: ID!, choseeId: ID!): User!
    resetChoices: Boolean!
  }
`;

module.exports = typeDefs;
