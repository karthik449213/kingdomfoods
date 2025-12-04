import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listDishes,
  createDish,
  updateDish,
  deleteDish,
  getFullMenu,
} from "../controllers/menuControllers.js";

const router = express.Router();

// Public routes
router.get("/full", getFullMenu);
router.get("/categories", listCategories);
router.get("/dishes", listDishes);

// Admin protected routes - Categories
router.post("/categories", adminAuth, upload.single("image"), createCategory);
router.put("/categories/:id", adminAuth, upload.single("image"), updateCategory);
router.delete("/categories/:id", adminAuth, deleteCategory);

// Admin protected routes - Dishes
router.post("/dishes", adminAuth, upload.single("image"), createDish);
router.put("/dishes/:id", adminAuth, upload.single("image"), updateDish);
router.delete("/dishes/:id", adminAuth, deleteDish);

export default router;
