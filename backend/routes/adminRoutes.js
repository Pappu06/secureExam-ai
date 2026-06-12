const express = require("express");

const {
  getAdminStats,
  handleAdminChat,
} = require("../controllers/adminController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/stats",
  protect,
  adminOnly,
  getAdminStats
);

router.post(
  "/chat",
  protect,
  adminOnly,
  handleAdminChat
);

module.exports = router;
