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
    } catch(error) {
      res.status(500).json({ message: `Unable to reach FaunaDB: ${error.message}` })
    } finally {
      const people = data.allUsers.data
        .sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))
        .map(user => ({
          _id: user._id,
          id: user.id,
          coupleId: user.coupleId,
          partnerId: user.partnerId,
          santa: user.santa,
          hasChosen: user.hasChosen,
          hasBeenChosen: user.hasBeenChosen,
          chosee: user.chosee,
          choseeCoupleId: user.choseeCoupleId
        }))
      res.status(200).json(people)
    }
  }

  // process UPDATE request
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

// import db from '../../db'

// export default function handler(req, res) {
//   // process GET request
//   if (req.method === 'GET') {
//     const params = {
//       TableName: process.env.DYNAMODB_TABLE_NAME
//     }
//     db.scan(params, function (err, data) {
//       if (err) {
//         console.error('unable to scan the table. error JSON:', JSON.stringify(err, null, 2))
//       } else {
//         data.Items.forEach(item => {
//           console.log('item', item)
//         })
//         res.status(200).json(data.Items)
//       }
//     })
//   }
  

//   // process PUT request
//   if (req.method === 'PUT') {
//     // for this project, body is only one entry at a time
//     // to update multiple entries, PUT must be called multiple times
//     const body = req.body
//     let objIndex = body.id
//     let updateExpression, expressionAV
//     if ('hasChosen' in body) {
//       updateExpression = "set chosee = :c, hasChosen = :hc, choseeCoupleId = :cci"
//       expressionAV = {
//         ":c": `${body.chosee}`,
//         ":hc": `${body.hasChosen}`,
//         ":cci": `${body.choseeCoupleId}`
//       }
//     } else {
//       updateExpression = "set hasBeenChosen = :hbc"
//       expressionAV = { ":hbc": `${body.hasBeenChosen}` }
//     }

//     const params = {
//       TableName: process.env.DYNAMODB_TABLE_NAME,
//       Key: {
//         id: objIndex
//       },
//       UpdateExpression: updateExpression,
//       ExpressionAttributeValues: expressionAV,
//       ReturnValues: "UPDATED_NEW"
//     }
//     console.log("Updating the item...")
//     db.update(params, function(err, data) {
//       if (err) {
//         console.error('unable to update item. error JSON:', JSON.stringify(err, null, 2))
//       } else {
//         console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2))
//         res.status(200).json(data)
//       }
//     })
//   }
// }

