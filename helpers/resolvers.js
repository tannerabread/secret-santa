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
    userByName: async (_, { name }) => {
      try {
        const result = await client.query(
          q.Get(q.Ref(q.Collection('User'), name))
        );
        return result.data;
      } catch (error) {
        throw new Error("Error fetching user by name: " + error.message);
      }
    }
  },
  Mutation: {
    createUser: async (_, { name, coupleId }) => {
      try {
        // Find a partner with the same coupleId
        const partners = await client.query(
          q.Paginate(q.Match(q.Index('users_by_coupleId'), coupleId))
        );
        
        const partnerRef = partners.data.length > 0 ? partners.data[0] : null;
        const partner = partnerRef ? await client.query(q.Get(partnerRef)) : null;
        
        const newUser = {
          name,
          coupleId,
          partnerId: partner && partner.ref ? partner.ref.id : null,
          hasChosen: false,
          hasBeenChosen: false,
          choseeId: null
        };

        const result = await client.query(
          q.Create(q.Collection('User'), { data: newUser })
        );

        // If a partner was found, update their partnerId to the new user's ID
        if (partner) {
          await client.query(
            q.Update(partner.ref, {
              data: { partnerId: result.ref.id }
            })
          );
        }

        return result.data;
      } catch (error) {
        throw new Error("Error creating user: " + error.message);
      }
    },
    updateUserChoice: async (_, { name, choseeName }) => {
      // This is a bit more complex as it involves multiple operations.
      // For simplicity, I'm providing a basic version. You might need to add more checks and operations.
      try {
        const user = await client.query(
          q.Get(q.Ref(q.Collection('User'), name))
        );

        const chosee = await client.query(
          q.Get(q.Ref(q.Collection('User'), choseeName))
        );

        if (chosee.data.hasBeenChosen) throw new Error("Chosee has already been chosen by someone else");
        if (user.data.coupleId === chosee.data.coupleId) throw new Error("Cannot choose your partner");

        const updatedUser = await client.query(
          q.Update(q.Ref(q.Collection('User'), name), {
            data: {
              hasChosen: true,
              choseeName: choseeName
            }
          })
        );

        await client.query(
          q.Update(q.Ref(q.Collection('User'), choseeName), {
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
                choseeName: null
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
