import graphql from './helpers/graphql'

// Query to fetch all users
const USERS_QUERY = `
query USERS {
  allUsers {
    data {
      _id
      id
      coupleId
      partnerId
      santa
      hasChosen
      hasBeenChosen
      chosee
      choseeCoupleId
    }
  }
}
`;

// Mutation to reset the database
const RESET_MUTATION = `
mutation ResetDatabase {
  // Your GraphQL mutation to reset the database goes here
}
`;

export default async function handler(req, res) {
  const { slug, action } = req.query;

  if (action === 'reset') {
    try {
      await graphql.request(RESET_MUTATION);
      res.status(200).json({ message: 'Database reset successfully' });
    } catch (error) {
      res.status(500).json({ message: `Unable to reset database: ${error.message}` });
    }
  } else if (action === 'checkValidity') {
    let data;
    try {
      data = await graphql.request(USERS_QUERY);
      const users = data.allUsers.data;

      // Logic to check the validity of choices
      let isValid = true;
      users.forEach(user => {
        if (user.hasChosen) {
          const chosee = users.find(u => u.santa === user.chosee);
          if (chosee.coupleId === user.coupleId) {
            isValid = false;
          }
        }
      });

      res.status(200).json({ isValid });
    } catch (error) {
      res.status(500).json({ message: `Unable to check validity: ${error.message}` });
    }
  } else {
    let data;
    try {
      data = await graphql.request(USERS_QUERY);
      const person = data.allUsers.data
        .filter(user => user.santa.toLowerCase() === slug.toLowerCase())
        .map(user => ({
          YourName: user.santa,
          YourPick: user.chosee
        }));
      res.status(200).json(person);
    } catch (error) {
      res.status(500).json({ message: `Unable to fetch user: ${error.message}` });
    }
  }
}
