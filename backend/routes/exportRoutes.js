const express = require("express");

const {
  exportResultsExcel,
} = require("../controllers/exportController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/excel/:examId",
  protect,
  adminOnly,
  exportResultsExcel
);

module.exports = router;