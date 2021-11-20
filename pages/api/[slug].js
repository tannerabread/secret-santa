import graphql from '../../helpers/graphql'

const query = `
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
`

export default async function handler(req, res) {
  console.log('req.query', req.query)
  const { slug } = req.query

  let data
  try {
    data = await graphql.request(query)
  } catch(error) {
    res.status(500).json({ message: `Unable to reach FaunaDB: ${error.message}` })
  } finally {
    const person = data.allUsers.data
      .filter((user) => user.santa.toLowerCase() === slug.toLowerCase())
      .map((user) => ({
        YourName: user.santa,
        YourPick: user.chosee
      }))
    res.status(200).json(person)
  }
}