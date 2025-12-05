import express from "express";
import rateLimit from "express-rate-limit";
const router = express.Router();
import { registerAdmin, loginAdmin } from "../controllers/authController.js";

// Registration endpoint: allow only when explicitly enabled via env
if (process.env.ALLOW_ADMIN_REGISTER === 'true') {
	// Only use register one time to create the first admin
	router.post("/register", registerAdmin);
} else {
	// Return a clear 403 so accidental attempts are blocked
	router.post("/register", (req, res) => {
		res.status(403).json({ message: "Admin registration is disabled." });
	});
}

// Rate limit login to mitigate brute-force attacks
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // limit each IP to 5 requests per windowMs
	message: { message: 'Too many login attempts from this IP, please try again later.' },
});

// Login route with limiter
router.post("/login", loginLimiter, loginAdmin);

export default router;
