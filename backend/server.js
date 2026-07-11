import env from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load the .env file from the backend directory
env.config({ path: path.resolve(__dirname, "./.env") });
import app from "./app.js"
import db, { ensureConnection } from "../dataBase/db.js"
const port=process.env.PORT||3100



async function StartServer(){
    try{
 await ensureConnection();
 app.listen(port,()=>{
     console.log(`Server running on port ${port}`)
 })
 }
 catch(err){
  console.error("Database connection failed:", err);
     process.exit(1);
 }


}



StartServer();

export default app;



