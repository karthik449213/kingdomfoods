import express from "express";
import { addDish, updateDish, deleteDish, getDishes, getDish } from "../controllers/dishController.js";
import { bulkUploadDishes, bulkUploadWithFiles } from "../controllers/bulkUploadController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// PUBLIC — customers see menu
router.get("/", getDishes);

// PUBLIC — get single dish by id
router.get("/:id", getDish);

// ADMIN — create dish
router.post("/add", adminAuth, upload.single("image"), addDish);

// ADMIN — bulk upload dishes (JSON with local file paths)
router.post("/bulk/upload", adminAuth, bulkUploadDishes);

// ADMIN — bulk upload dishes (multipart form data with image files)
router.post("/bulk/upload-with-files", adminAuth, upload.any(), bulkUploadWithFiles);

// ADMIN — update dish
router.put("/:id", adminAuth, upload.single("image"), updateDish);

// ADMIN — delete dish
router.delete("/:id", adminAuth, deleteDish);

export default router;
