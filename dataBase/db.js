import mysql from "mysql2"
import "dotenv/config"

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.host || 'localhost',
  user: process.env.MYSQLUSER || process.env.user || 'root',
  password: process.env.MYSQLPASSWORD || process.env.password,
  database: process.env.MYSQLDATABASE || process.env.DATABASE_DB,
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});



export default pool;