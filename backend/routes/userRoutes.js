const express = require("express");

const {
  getProfile,
  updateProfile,
  changePassword,
  adminDashboard,
} = require("../controllers/userController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

router.get(
  "/admin",
  protect,
  adminOnly,
  adminDashboard
);

module.exports = router;