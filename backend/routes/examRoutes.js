const express = require("express");

const {
  createExam,
  getExams,
  getExamById,
  addQuestion,
  getQuestionsByExam,
  submitExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE EXAM
router.post(
  "/create",
  protect,
  adminOnly,
  createExam
);


// GET EXAMS
router.get(
  "/all",
  protect,
  getExams
);


// GET EXAM BY ID
router.get(
  "/details/:id",
  protect,
  getExamById
);


// ADD QUESTION
router.post(
  "/question/add",
  protect,
  adminOnly,
  addQuestion
);


// GET QUESTIONS
router.get(
  "/questions/:examId",
  protect,
  getQuestionsByExam
);


// SUBMIT EXAM
router.post(
  "/submit",
  protect,
  submitExam
);


router.put( "/:id", protect, adminOnly, updateExam);

router.delete("/:id",protect,adminOnly,deleteExam);


module.exports = router;