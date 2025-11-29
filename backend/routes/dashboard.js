const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  res.json({
    message: "Admin Dashboard Access Granted",
    adminId: req.admin.id
  });
});

module.exports = router;
