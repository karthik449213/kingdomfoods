import express from "express";
import upload from "../middleware/upload.js";
import { getCategories, createCategory, getSubcategories, createSubcategory, getDishesForSubcategory } from "../controllers/categoryController.js";

const router = express.Router();

// GET all categories
router.get("/", getCategories);

// POST create a new category
router.post("/", upload.single("image"), createCategory);

// GET subcategories for a category
router.get("/:categorySlug/subcategories", getSubcategories);

// POST create a new subcategory
router.post("/:categorySlug/subcategories", upload.single("image"), createSubcategory);

// GET dishes for a subcategory
router.get("/:categorySlug/subcategories/:subcategorySlug/dishes", getDishesForSubcategory);

export default router;
