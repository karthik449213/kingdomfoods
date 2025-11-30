import express from "express";
import { addDish, updateDish, deleteDish, getDishes, getDish } from "../controllers/dishController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// PUBLIC — customers see menu
router.get("/", getDishes);

// PUBLIC — get single dish by id
router.get("/:id", getDish);

// ADMIN — create dish
router.post("/add", adminAuth, upload.single("image"), addDish);

// ADMIN — update dish
router.put("/:id", adminAuth, upload.single("image"), updateDish);

// ADMIN — delete dish
router.delete("/:id", adminAuth, deleteDish);

export default router;
