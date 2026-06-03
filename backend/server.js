import env from "dotenv"
env.config()
import app from "./src/app.js"
import db from "./src/DataBase/db.js"
const port=process.env.PORT||3100



async function StartServer(){
    try{
 db.query("select 1");
console.log('Database successfully connected')
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



