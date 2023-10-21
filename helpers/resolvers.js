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
        const userRef = await client.query(
          q.Match(q.Index('userByName'), name)
        );
        const user = await client.query(q.Get(userRef));
        
        const choseeRef = await client.query(
          q.Match(q.Index('userByName'), choseeName)
        );
        const chosee = await client.query(q.Get(choseeRef));      

        if (chosee.data.hasBeenChosen) throw new Error("Chosee has already been chosen by someone else");
        if (user.data.coupleId === chosee.data.coupleId) throw new Error("Cannot choose your partner");

        const updatedUser = await client.query(
          q.Update(user.ref, {
            data: {
              hasChosen: true,
              choseeName: choseeName
            }
          })
        );
        
        await client.query(
          q.Update(chosee.ref, {
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
        // Retrieve all user references
        const userRefs = await client.query(
          q.Paginate(q.Documents(q.Collection('User')))
        );
    
        // Loop through each reference and update the user data
        const updatePromises = userRefs.data.map(userRef => {
          return client.query(
            q.Update(userRef, {
              data: {
                hasChosen: false,
                hasBeenChosen: false,
                choseeName: null
              }
            })
          );
        });
    
        // Wait for all updates to complete
        await Promise.all(updatePromises);
    
        return true;
      } catch (error) {
        console.error("Error in resetChoices:", error);
        throw new Error("Error resetting choices: " + error.message);
      }
    }    
  }
};

module.exports = resolvers;
