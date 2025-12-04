import express from "express";
import upload from "../middleware/upload.js";
import { getCategories, createCategory } from "../controllers/categoryController.js";

const router = express.Router();

// GET all categories
router.get("/", getCategories);

// POST create a new category
router.post("/", upload.single("image"), createCategory);

export default router;
