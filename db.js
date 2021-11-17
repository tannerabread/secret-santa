import AWS from 'aws-sdk'

// Update AWS config
AWS.config.update({
  // AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are reserved variable names on Vercel
  accesKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
})

// create DynamoDB service object
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: "latest" })

export default db