import aws from 'aws-sdk'

aws.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION
})

const db = new aws.DynamoDB.DocumentClient({ apiVersion: "latest" })

export default db