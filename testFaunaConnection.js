// testFaunaConnection.js

const faunadb = require('faunadb');
const q = faunadb.query;

// Ensure your FAUNA_SECRET_KEY is available here.
const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY });

async function fetchAllUsers() {
  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('User'))),
        q.Lambda('userRef', q.Get(q.Var('userRef')))
      )
    );
    console.log("Fetched users:", result.data.map(user => user.data));
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

fetchAllUsers();
