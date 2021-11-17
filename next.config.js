module.exports = {
  reactStrictMode: true,
  env: {
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_KEY: process.env.SECRET_KEY,
    REGION: process.env.REGION,
    TABLE_NAME: process.env.TABLE_NAME
  }
}
