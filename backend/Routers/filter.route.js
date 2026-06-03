import express from "express"
import filter from "../Controllers/filter.controller.js"
const router=express.Router();

// this route will get the query parameters attched via frontend
router.get("/pgs", filter.getFilteredPgs);
export default router