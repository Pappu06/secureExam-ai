const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Result = require("../models/Result");
const crypto = require("crypto");


// Generate a random 6-character alphanumeric exam code
const generateExamCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

const normalizeAccessType = (accessType) => (
  accessType === "public" ? "public" : "private"
);

const generateUniqueExamCode = async () => {
  let examCode;
  let isUnique = false;

  while (!isUnique) {
    examCode = generateExamCode();
    const existing = await Exam.findOne({ examCode });
    if (!existing) isUnique = true;
  }

  return examCode;
};


// CREATE EXAM
const createExam = async (req, res) => {

  try {

    const {
      title,
      description,
      duration,
      allowReattempt,
      maxAttempts,
      accessType,
    } = req.body;

    const normalizedAccessType = normalizeAccessType(accessType);
    const examCode = normalizedAccessType === "private"
      ? await generateUniqueExamCode()
      : undefined;

    const exam = await Exam.create({
      title,
      description,
      duration,
      allowReattempt: allowReattempt || false,
      maxAttempts: allowReattempt ? Math.min(Math.max(maxAttempts || 1, 1), 3) : 1,
      accessType: normalizedAccessType,
      examCode,
      createdBy: req.user._id,
    });

    res.status(201).json(exam);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// GET ALL EXAMS
const getExams = async (req, res) => {

  try {

    const exams = await Exam.find()
      .populate("createdBy", "name");

    // For each exam, get the question count
    const examsWithCount = await Promise.all(
      exams.map(async (exam) => {
        const questionCount = await Question.countDocuments({
          exam: exam._id,
        });
        return {
          ...exam.toObject(),
          questionCount,
        };
      })
    );

    res.status(200).json(examsWithCount);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// GET EXAM BY ID
const getExamById = async (req, res) => {

  try {

    const exam = await Exam.findById(req.params.id)
      .populate("createdBy", "name");

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    const questionCount = await Question.countDocuments({
      exam: exam._id,
    });

    res.status(200).json({
      ...exam.toObject(),
      questionCount,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


const addQuestion = async (req, res) => {

  try {

    const {
      examId,
      questionText,
      options,
      correctAnswer,
      marks,
    } = req.body;

    const question = await Question.create({
      exam: examId,
      questionText,
      options,
      correctAnswer,
      marks,
    });

    res.status(201).json(question);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const getQuestionsByExam = async (req, res) => {

  try {

    const questions = await Question.find({
      exam: req.params.examId,
    });

    res.status(200).json(questions);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const submitExam = async (req, res) => {

  try {

    const {
      examId,
      answers,
      timeTaken,
      violations,
    } = req.body;

    // Check attempt count before allowing submission
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const existingAttempts = await Result.countDocuments({
      student: req.user._id,
      exam: examId,
    });

    const allowedAttempts = exam.allowReattempt ? exam.maxAttempts : 1;
    if (existingAttempts >= allowedAttempts) {
      return res.status(400).json({
        message: `Maximum attempts (${allowedAttempts}) reached for this exam.`,
      });
    }

    // Get questions
    const questions = await Question.find({
      exam: examId,
    });

    let score = 0;
    let totalMarks = 0;

    // Check answers
    questions.forEach((question) => {

      totalMarks += question.marks || 1;

      const studentAnswer = answers.find(
        (a) =>
          a.questionId === question._id.toString()
      );

      if (
        studentAnswer &&
        studentAnswer.selectedAnswer ===
          question.correctAnswer
      ) {
        score += question.marks || 1;
      }

    });

    // Calculate percentage
    const percentage = totalMarks > 0
      ? Math.round((score / totalMarks) * 100)
      : 0;

    // Save result
    const result = await Result.create({
      student: req.user._id,
      exam: examId,
      score,
      totalQuestions: questions.length,
      percentage,
      timeTaken: timeTaken || 0,
      violations: violations || 0,
      answers,
    });

    res.status(200).json({
      message: "Exam submitted",
      score,
      percentage,
      result,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const updateExam = async (req, res) => {

  try {

    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    const updates = { ...req.body };
    delete updates.examCode;
    delete updates.createdBy;

    if (updates.accessType !== undefined) {
      updates.accessType = normalizeAccessType(updates.accessType);
    }

    if (updates.allowReattempt !== undefined) {
      updates.maxAttempts = updates.allowReattempt
        ? Math.min(Math.max(updates.maxAttempts || 1, 1), 3)
        : 1;
    }

    Object.assign(exam, updates);

    if (exam.accessType === "public") {
      exam.examCode = undefined;
    } else if (!exam.examCode) {
      exam.examCode = await generateUniqueExamCode();
    }

    await exam.save();

    res.status(200).json(exam);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


const deleteExam = async (req, res) => {

  try {

    const exam = await Exam.findById(
      req.params.id
    );

    if (!exam) {

      return res.status(404).json({
        message: "Exam not found",
      });

    }

    await Question.deleteMany({
      exam: exam._id,
    });

    await exam.deleteOne();

    res.status(200).json({
      message: "Exam deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  addQuestion,
  getQuestionsByExam,
  submitExam,
  updateExam,
  deleteExam,
};
