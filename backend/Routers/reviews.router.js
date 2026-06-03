import express from "express";
import authUser from "../Middlewares/auth.middleware.User.js"
import Review from "../Controllers/review.controllers.js"
const router=express.Router()

// reviews are only added by users not owners
router.post("/pg/:pgId",authUser.AuthUsers,Review.createReview)
router.get("/pg/:pgId",Review.getReviewsByPg)



export default router