import express from "express";
import upload from "../middleware/upload.js";
import { createDish } from "../controllers/dishController.js";

const router = express.Router();

router.post("/add-dish", upload.single("image"), createDish);

export default router;
