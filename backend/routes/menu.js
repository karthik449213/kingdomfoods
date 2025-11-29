import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";
import { createMenuItem, getMenu, updateMenuItem, deleteMenuItem } from "../controllers/menuController.js";

router.post("/add", auth, createMenuItem);
router.get("/", getMenu);
router.put("/:id", auth, updateMenuItem);
router.delete("/:id", auth, deleteMenuItem);

export default router;
