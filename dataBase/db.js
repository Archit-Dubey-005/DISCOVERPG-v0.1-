import mysql from "mysql2"
import "dotenv/config"

// Helper to resolve template variables like ${{VAR}}
function resolveEnvValue(val) {
  if (typeof val !== 'string') return val;
  return val.replace(/\$\{\{([^}]+)\}\}/g, (_, name) => {
    return process.env[name] || '';
  });
}

// Resolve all environment variables
const MYSQLHOST = resolveEnvValue(process.env.MYSQLHOST);
const MYSQLUSER = resolveEnvValue(process.env.MYSQLUSER);
const MYSQLPASSWORD = resolveEnvValue(process.env.MYSQLPASSWORD);
const MYSQLDATABASE = resolveEnvValue(process.env.MYSQLDATABASE);
const MYSQLPORT = resolveEnvValue(process.env.MYSQLPORT);
const MYSQL_URL = resolveEnvValue(process.env.MYSQL_URL);
const MYSQL_PUBLIC_URL = resolveEnvValue(process.env.MYSQL_PUBLIC_URL);

// Original local environment variables (if any)
const localHost = process.env.host || 'localhost';
const localUser = process.env.user || 'root';
const localPassword = process.env.password || '';
const localDatabase = process.env.DATABASE_DB || '';
const localPort = 3306;

let poolConfig = {};

// Helper to check if a value is resolved and not a placeholder
const isResolved = (val) => {
  return val && typeof val === 'string' && !val.includes('${{') && val.trim() !== '';
};

// Helper to check if a connection URL is valid and fully resolved
const isValidConnectionUrl = (url) => {
  if (!isResolved(url)) return false;
  try {
    const parsed = new URL(url);
    return !!parsed.hostname;
  } catch (e) {
    return false;
  }
};

// If a fully resolved connection URL is available, use it (typically for Railway or custom DB URI)
if (isValidConnectionUrl(MYSQL_URL)) {
  poolConfig = { uri: MYSQL_URL };
} else if (isValidConnectionUrl(MYSQL_PUBLIC_URL)) {
  poolConfig = { uri: MYSQL_PUBLIC_URL };
} else {
  // Otherwise, use individual parameters
  // If MYSQLHOST is resolved to a valid non-empty host, use Railway credentials.
  // If it's not resolved, we are likely running locally, so we fallback to local config.
  if (isResolved(MYSQLHOST)) {
    poolConfig = {
      host: MYSQLHOST,
      user: isResolved(MYSQLUSER) ? MYSQLUSER : 'root',
      password: isResolved(MYSQLPASSWORD) ? MYSQLPASSWORD : '',
      database: isResolved(MYSQLDATABASE) ? MYSQLDATABASE : '',
      port: isResolved(MYSQLPORT) ? parseInt(MYSQLPORT, 10) : 3306
    };
  } else {
    // Local fallback
    poolConfig = {
      host: localHost,
      user: localUser,
      password: localPassword,
      database: localDatabase,
      port: localPort
    };
  }
}

// Add common pool options
poolConfig.waitForConnections = true;
poolConfig.connectionLimit = 10;

const pool = mysql.createPool(poolConfig);

export default pool;