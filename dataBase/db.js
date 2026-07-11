import mysql from "mysql2"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load the .env file from the backend directory
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

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

// Build the candidate configurations in order of preference:
// 1. Private Connection URL (best within Railway)
// 2. Private Host/Port configuration
// 3. Public Connection URL (if connecting from outside Railway)
// 4. Local fallback config (localhost)
const configs = [];

if (isValidConnectionUrl(MYSQL_URL)) {
  configs.push({ name: "Railway Private URL", uri: MYSQL_URL });
}

if (isResolved(MYSQLHOST)) {
  configs.push({
    name: "Railway Private Host Config",
    host: MYSQLHOST,
    user: isResolved(MYSQLUSER) ? MYSQLUSER : 'root',
    password: isResolved(MYSQLPASSWORD) ? MYSQLPASSWORD : '',
    database: isResolved(MYSQLDATABASE) ? MYSQLDATABASE : '',
    port: isResolved(MYSQLPORT) ? parseInt(MYSQLPORT, 10) : 3306
  });
}

if (isValidConnectionUrl(MYSQL_PUBLIC_URL)) {
  configs.push({ name: "Railway Public URL", uri: MYSQL_PUBLIC_URL });
}

// Always add local config as final fallback
configs.push({
  name: "Local Fallback",
  host: localHost,
  user: localUser,
  password: localPassword,
  database: localDatabase,
  port: localPort
});

let activePool = null;
let currentConfigIndex = 0;

function createPoolForConfig(config) {
  const { name, ...options } = config;
  return mysql.createPool({
    ...options,
    connectTimeout: 3000, // 3 seconds timeout
    waitForConnections: true,
    connectionLimit: 10
  });
}

// Initialize with the first configuration
activePool = createPoolForConfig(configs[0]);

// Proxy to intercept pool calls and delegate to the active pool
const poolProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'promise') {
      return () => {
        const promisePool = activePool.promise();
        return new Proxy(promisePool, {
          get(promiseTarget, promiseProp) {
            const value = promiseTarget[promiseProp];
            if (typeof value === 'function') {
              return value.bind(promiseTarget);
            }
            return value;
          }
        });
      };
    }
    const value = activePool[prop];
    if (typeof value === 'function') {
      return value.bind(activePool);
    }
    return value;
  }
});

// Helper to switch to the next working configuration
export async function ensureConnection() {
  while (currentConfigIndex < configs.length) {
    const config = configs[currentConfigIndex];
    try {
      await new Promise((resolve, reject) => {
        activePool.query("SELECT 1", (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log(`Database connected successfully using: ${config.name}`);
      return true;
    } catch (err) {
      console.warn(`Connection failed for config: ${config.name}. Error: ${err.message}`);
      
      // Close the current failing pool
      activePool.end();
      
      currentConfigIndex++;
      if (currentConfigIndex < configs.length) {
        const nextConfig = configs[currentConfigIndex];
        console.log(`Attempting fallback to: ${nextConfig.name}`);
        activePool = createPoolForConfig(nextConfig);
      } else {
        throw new Error("All database configurations failed to connect.");
      }
    }
  }
  return false;
}

export default poolProxy;