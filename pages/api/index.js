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
  // process GET request
  if (req.method === 'GET') {
    let data
    try {
      data = await graphql.request(query)
    } catch (error) {
      res
        .status(500)
        .json({ message: `Unable to reach FaunaDB: ${error.message}` })
    } finally {
      const people = data.allUsers.data
        .sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0))
        .map((user) => ({
          _id: user._id,
          id: user.id,
          coupleId: user.coupleId,
          partnerId: user.partnerId,
          santa: user.santa,
          hasChosen: user.hasChosen,
          hasBeenChosen: user.hasBeenChosen,
          chosee: user.chosee,
          choseeCoupleId: user.choseeCoupleId,
        }))
      res.status(200).json(people)
    }
  }

  // process POST request
  if (req.method === 'POST') {
    const data = req.body
    console.log('data', data)

    if (data.hasChosen) {
      // update choser document
      const updateChooser = `
        mutation UPDATE_USER($_id: ID!, $hasChosen: Boolean, $chosee: String, $choseeCoupleId: Int) {
          updateUser(id: $_id, data: {
            hasChosen: $hasChosen 
            chosee: $chosee
            choseeCoupleId: $choseeCoupleId
          }) {
            santa
            hasChosen
            chosee
            choseeCoupleId
          }
        }
      `
      const updateChooserParameters = {
        _id: data._id,
        hasChosen: data.hasChosen,
        chosee: data.chosee,
        choseeCoupleId: data.choseeCoupleId,
      }
      await graphql.request(updateChooser, updateChooserParameters)
      res.status(200).json({ message: 'Successfully updated Chooser Document' })
    } else if (data.hasBeenChosen) {
      // update chosee document
      const updateChosen = `
        mutation UPDATE_USER($_id: ID!, $hasBeenChosen: Boolean) {
          updateUser(id: $_id, data: { hasBeenChosen: $hasBeenChosen }) {
            santa
            hasBeenChosen
          }
        }
      `
      const updateChosenParameters = {
        _id: data._id,
        hasBeenChosen: data.hasBeenChosen,
      }
      await graphql.request(updateChosen, updateChosenParameters)
      res.status(200).json({ message: 'Successfully updated Chosen Document' })
    }
  }
}
