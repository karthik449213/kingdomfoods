import express from "express";
const router = express.Router();
import verifyAdmin from "../middleware/adminAuth.js";

router.get("/", verifyAdmin, (req, res) => {
  res.json({
    message: "Admin Dashboard Access Granted",
    adminId: req.admin.id
  });
});

export default router;
