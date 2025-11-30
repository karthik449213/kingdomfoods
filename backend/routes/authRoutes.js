import express from "express";
const router = express.Router();
import { registerAdmin, loginAdmin } from "../controllers/authcontroller.js";



// Only use register one time to create admin
router.post("/register", registerAdmin);

// Login route
router.post("/login", loginAdmin);

export default router;
