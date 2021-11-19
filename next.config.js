module.exports = {
  reactStrictMode: true,
  env: {
    DYNAMODB_ACCESS_KEY: process.env.DYNAMODB_ACCESS_KEY,
    DYNAMODB_SECRET_ACCESS_KEY: process.env.DYNAMODB_SECRET_ACCESS_KEY,
    DYNAMODB_REGION: process.env.DYNAMODB_REGION,
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME
  }
}
