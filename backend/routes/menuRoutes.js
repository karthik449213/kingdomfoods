import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryVisibility,
  listSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  toggleSubCategoryVisibility,
  listDishes,
  createDish,
  updateDish,
  deleteDish,
  toggleDishVisibility,
  getFullMenu,
  getDishesByNoSubcategory,
  getDishesBySubcategory,
  getAllDishesOrganized,
  getOrganizedMenu,
  getHiddenCategories,
  getHiddenSubCategories,
  getHiddenDishes,
} from "../controllers/menuControllers.js";

const router = express.Router();

// Public routes
router.get("/full", getFullMenu);
router.get("/categories", listCategories);
router.get("/dishes", listDishes);
router.get("/dishes/standalone/all", getDishesByNoSubcategory);
router.get("/dishes/categorized/all", getDishesBySubcategory);
router.get("/dishes/organized/all", getAllDishesOrganized);
router.get("/organized", getOrganizedMenu);
router.get("/subcategories", listSubCategories);


// Admin protected routes - Hidden items
router.get("/admin/hidden-categories", adminAuth, getHiddenCategories);
router.get("/admin/hidden-subcategories", adminAuth, getHiddenSubCategories);
router.get("/admin/hidden-dishes", adminAuth, getHiddenDishes);

// Admin protected routes - Categories
router.post("/categories", adminAuth, upload.single("image"), createCategory);
router.put("/categories/:id", adminAuth, upload.single("image"), updateCategory);
router.delete("/categories/:id", adminAuth, deleteCategory);
router.patch("/categories/:id/toggle-visibility", adminAuth, toggleCategoryVisibility);

// Admin protected routes - SubCategories
router.post("/subcategories", adminAuth, upload.single("image"), createSubCategory);
router.put("/subcategories/:id", adminAuth, upload.single("image"), updateSubCategory);
router.delete("/subcategories/:id", adminAuth, deleteSubCategory);
router.patch("/subcategories/:id/toggle-visibility", adminAuth, toggleSubCategoryVisibility);

// Admin protected routes - Dishes
router.post("/dishes", adminAuth, upload.single("image"), createDish);
router.put("/dishes/:id", adminAuth, upload.single("image"), updateDish);
router.delete("/dishes/:id", adminAuth, deleteDish);
router.patch("/dishes/:id/toggle-visibility", adminAuth, toggleDishVisibility);

export default router;
