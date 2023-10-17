const faunadb = require('faunadb');
const q = faunadb.query;
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY });

const resolvers = {
  Query: {
    allUsers: async () => {
      try {
        const result = await client.query(
          q.Map(
            q.Paginate(q.Documents(q.Collection('User'))),
            q.Lambda('userRef', q.Get(q.Var('userRef')))
          )
        );
        return result.data.map(user => user.data);
      } catch (error) {
        throw new Error("Error fetching users: " + error.message);
      }
    },
    userById: async (_, { id }) => {
      try {
        const result = await client.query(
          q.Get(q.Ref(q.Collection('User'), id))
        );
        return result.data;
      } catch (error) {
        throw new Error("Error fetching user by ID: " + error.message);
      }
    }
  },
  Mutation: {
    createUser: async (_, { name, coupleId, partnerId }) => {
      try {
        const result = await client.query(
          q.Create(q.Collection('User'), {
            data: {
              name,
              coupleId,
              partnerId,
              hasChosen: false,
              hasBeenChosen: false,
              choseeId: null
            }
          })
        );
        return result.data;
      } catch (error) {
        throw new Error("Error creating user: " + error.message);
      }
    },
    updateUserChoice: async (_, { userId, choseeId }) => {
      // This is a bit more complex as it involves multiple operations.
      // For simplicity, I'm providing a basic version. You might need to add more checks and operations.
      try {
        const user = await client.query(
          q.Get(q.Ref(q.Collection('User'), userId))
        );

        const chosee = await client.query(
          q.Get(q.Ref(q.Collection('User'), choseeId))
        );

        if (chosee.data.hasBeenChosen) throw new Error("Chosee has already been chosen by someone else");
        if (user.data.coupleId === chosee.data.coupleId) throw new Error("Cannot choose your partner");

        const updatedUser = await client.query(
          q.Update(q.Ref(q.Collection('User'), userId), {
            data: {
              hasChosen: true,
              choseeId: choseeId
            }
          })
        );

        await client.query(
          q.Update(q.Ref(q.Collection('User'), choseeId), {
            data: {
              hasBeenChosen: true
            }
          })
        );

        return updatedUser.data;

      } catch (error) {
        throw new Error("Error updating user choice: " + error.message);
      }
    },
    resetChoices: async () => {
      try {
        const users = await resolvers.Query.allUsers();
        for (let user of users) {
          await client.query(
            q.Update(q.Ref(q.Collection('User'), user.id), {
              data: {
                hasChosen: false,
                hasBeenChosen: false,
                choseeId: null
              }
            })
          );
        }
        return true;
      } catch (error) {
        throw new Error("Error resetting choices: " + error.message);
      }
    }
  }
};

module.exports = resolvers;
