import mysql from "mysql2"
import "dotenv/config"

const pool = mysql.createPool({
  host: process.env.HOST_DB,
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  database: process.env.DATABASE_DB,
  waitForConnections: true,
  connectionLimit: 10
});



export default pool;