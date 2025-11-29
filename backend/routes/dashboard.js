import express from "express";
const router = express.Router();
import auth from "../middleware/auth.js";

router.get("/", auth, (req, res) => {
  res.json({
    message: "Admin Dashboard Access Granted",
    adminId: req.admin.id
  });
});

export default router;
