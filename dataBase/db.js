
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: "hayabusa.proxy.rlwy.net",
      port: 54222,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}

export default getPool();