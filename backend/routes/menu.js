const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const menuController = require("../controllers/menuController");

router.post("/add", auth, menuController.createMenuItem);
router.get("/", auth, menuController.getMenu);
router.put("/:id", auth, menuController.updateMenuItem);
router.delete("/:id", auth, menuController.deleteMenuItem);

module.exports = router;
