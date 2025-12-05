import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
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
router.get("/subcategories", listSubCategories);

// Admin protected routes - Categories
router.post("/categories", adminAuth, upload.single("image"), createCategory);
router.put("/categories/:id", adminAuth, upload.single("image"), updateCategory);
router.delete("/categories/:id", adminAuth, deleteCategory);

// Admin protected routes - SubCategories
router.post("/subcategories", adminAuth, upload.single("image"), createSubCategory);
router.put("/subcategories/:id", adminAuth, upload.single("image"), updateSubCategory);
router.delete("/subcategories/:id", adminAuth, deleteSubCategory);

// Admin protected routes - Dishes
router.post("/dishes", adminAuth, upload.single("image"), createDish);
router.put("/dishes/:id", adminAuth, upload.single("image"), updateDish);
router.delete("/dishes/:id", adminAuth, deleteDish);

export default router;
