const faunadb = require('faunadb');
const q = faunadb.query;

const client = new faunadb.Client({ secret: process.env.FAUNA_SECRET_KEY });

const couples = [
  ["Chris", "Marilyn"],
  ["Alex", "Mayling"],
  ["Dusty", "Eri"],
  ["Bannon", "Hannah"],
  ["Zach", "Amelie"]
];

async function resetDB() {
  // Delete all existing users
  const allUsers = await client.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection("User"))),
      q.Lambda(x => q.Delete(x))
    )
  );

  console.log("Deleted all existing users.");

  // Add new users
  let userId = 1;
  let coupleId = 1;

  for (let couple of couples) {
    for (let person of couple) {
      const partnerId = (userId % 2 === 0) ? userId - 1 : userId + 1;

      await client.query(
        q.Create(q.Collection("User"), {
          data: {
            id: userId,
            coupleId: coupleId,
            partnerId: partnerId,
            santa: person,
            hasChosen: false,
            hasBeenChosen: false
          }
        })
      );

      userId++;
    }
    coupleId++;
  }

  console.log("Added new users based on provided couples data.");
}

resetDB().then(() => {
  console.log("Database reset and new users added successfully.");
}).catch(error => {
  console.error("Error resetting the database:", error);
});
