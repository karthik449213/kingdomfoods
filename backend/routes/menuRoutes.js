import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  listDishes,
  createDish,
  updateDish,
  deleteDish,
  getFullMenu,
} from "../controllers/menuControllers.js";

const router = express.Router();

// Public
router.get("/full", getFullMenu);
router.get("/categories", listCategories);
router.get("/subcategories", listSubcategories);
router.get("/subcategories/:categoryId", listSubcategories);
router.get("/dishes", listDishes);

// Admin protected
router.post("/categories", adminAuth, upload.single("image"), createCategory);
router.put("/categories/:id", adminAuth, upload.single("image"), updateCategory);
router.delete("/categories/:id", adminAuth, deleteCategory);

router.post("/subcategories", adminAuth, upload.single("image"), createSubcategory);
router.put("/subcategories/:id", adminAuth, upload.single("image"), updateSubcategory);
router.delete("/subcategories/:id", adminAuth, deleteSubcategory);

router.post("/dishes", adminAuth, upload.single("image"), createDish);
router.put("/dishes/:id", adminAuth, upload.single("image"), updateDish);
router.delete("/dishes/:id", adminAuth, deleteDish);

export default router;
