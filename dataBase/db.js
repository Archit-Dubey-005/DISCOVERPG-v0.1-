import mysql from "mysql2"
import "dotenv/config"

const pool = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.DATABASE_DB,
  waitForConnections: true,
  connectionLimit: 10
});



export default pool;