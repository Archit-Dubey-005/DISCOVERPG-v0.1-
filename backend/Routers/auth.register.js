import express from "express"
import authController from "../Controllers/auth.controller.js"
const router=express.Router()


//users
router.post("/register",authController.RegisterUser)
router.post("/login",authController.LoginUser)
router.post("/google",authController.GoogleRegister)



// owners
router.post("/registerOwner",authController.RegisterOwner)
router.post("/loginOwner",authController.LoginOwner)
router.post("/googleOwner",authController.GoogleRegisterOwner)

export default router