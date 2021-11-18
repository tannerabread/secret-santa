import db from '../../db'

export default function handler(req, res) {
  // process GET request
  if (req.method === 'GET') {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME
    }
    db.scan(params, function (err, data) {
      if (err) {
        console.error('unable to scan the table. error JSON:', JSON.stringify(err, null, 2))
      } else {
        data.Items.forEach(item => {
          console.log('item', item)
        })
        res.status(200).json(data.Items)
      }
    })
  }
  

  // process PUT request
  if (req.method === 'PUT') {
    // for this project, body is only one entry at a time
    // to update multiple entries, PUT must be called multiple times
    const body = req.body
    let objIndex = body.id
    let updateExpression, expressionAV
    if ('hasChosen' in body) {
      updateExpression = "set chosee = :c, hasChosen = :hc, choseeCoupleId = :cci"
      expressionAV = {
        ":c": `${body.chosee}`,
        ":hc": `${body.hasChosen}`,
        ":cci": `${body.choseeCoupleId}`
      }
    } else {
      updateExpression = "set hasBeenChosen = :hbc"
      expressionAV = { ":hbc": `${body.hasBeenChosen}` }
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        id: objIndex
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAV,
      ReturnValues: "UPDATED_NEW"
    }
    console.log("Updating the item...")
    db.update(params, function(err, data) {
      if (err) {
        console.error('unable to update item. error JSON:', JSON.stringify(err, null, 2))
      } else {
        console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2))
        res.status(200).json(data)
      }
    })
  }
}

