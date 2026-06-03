import express from "express";
import upload from "../Middlewares/multer.service.js";
import authMiddleware from "../Middlewares/auth.middleware.Owner.js";
import imageController from "../Controllers/pg_images.controller.js";

const router = express.Router();

// add  image to pg
router.post(
  "/:pgId/images",
  authMiddleware.AuthOwners,
  upload.single("image"),
  imageController.addImage
);

// get allimages of pg
router.get("/:pgId/images", imageController.getImages);

// delete image
router.delete(
  "/:imageId",
  authMiddleware.AuthOwners,
  imageController.deleteImage
);

export default router;
