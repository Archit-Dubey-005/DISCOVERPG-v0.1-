import "dotenv/config"
import jwt from "jsonwebtoken"

async function AuthUsers(req,res,next){
const token = req.cookies.token;
if(!token){
   return  res.status(401).json({
    message:"Unauthorized User"
   })
}
try{
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
if(decoded.role!=="User"){
    return res.status(403).json({message:"You cannot access this page"})
}
req.user=decoded
next()
}
catch(err){
return res.status(401).json({
      message: "Invalid or expired token",
    })
}







}



export default {AuthUsers};