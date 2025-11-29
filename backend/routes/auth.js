import express from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// REGISTER (only once to create the admin account)
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if exists
    const checkAdmin = await Admin.findOne({ email });
    if (checkAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password: hashedPass
    });

    res.json({ message: "Admin created", admin });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create token
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
