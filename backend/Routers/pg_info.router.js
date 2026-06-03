import express from "express"
import pg_infoController from "../Controllers/pg_info.controller.js"
import authMiddleware from "../Middlewares/auth.middleware.Owner.js"
const router=express.Router()

//pg CRUD
router.post("/createPG",authMiddleware.AuthOwners, pg_infoController.createPgListing);
router.put("/updatePG/:id", authMiddleware.AuthOwners,pg_infoController.updatePg);
router.delete("/deletePG/:id",authMiddleware.AuthOwners,pg_infoController.deletePgListing);
router.get("/PG", pg_infoController.getAllPgListings);
router.get("/PG/:id", pg_infoController.getPgListingById);

export default router 