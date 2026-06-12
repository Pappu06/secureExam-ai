const express = require("express");

const {
  getAllResults,
  getResultsByExam,
  getMyResults,
  getResultById,
} = require("../controllers/resultController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();


// STUDENT: Get my results
router.get(
  "/my",
  protect,
  getMyResults
);

// STUDENT: Get single result by ID
router.get(
  "/:id",
  protect,
  getResultById
);


// ADMIN: Get all results
router.get(
  "/",
  protect,
  adminOnly,
  getAllResults
);

router.get(
  "/exam/:examId",
  protect,
  adminOnly,
  getResultsByExam
);

module.exports = router;