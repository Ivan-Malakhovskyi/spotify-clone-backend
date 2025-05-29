export default () => ({
  port: parseInt(process.env.PORT as string),
  secret: process.env.AUTH_SECRET,
  host: process.env.DB_HOST,
  dbPort: parseInt(process.env.DB_PORT as string),
  dbUser: process.env.DB_USER,
  password: process.env.PASSWORD,
  dbName: process.env.DB_NAME,
});
