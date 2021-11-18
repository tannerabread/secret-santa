import AWS from 'aws-sdk'

// Update AWS config
AWS.config.update({
  // AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are reserved variable names on Vercel
  accesKeyId: process.env.DYNAMODB_ACCESS_KEY_ID,
  secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
  region: process.env.DYNAMODB_REGION,
})

// create DynamoDB service object
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: "latest" })

export default db