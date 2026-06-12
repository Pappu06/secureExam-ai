const Result = require("../models/Result");
const Question = require("../models/Question");

const getAllResults = async (req, res) => {

  try {

    const results = await Result.find()
      .populate("student", "name email")
      .populate("exam", "title duration totalMarks");

    res.status(200).json(results);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

const getResultsByExam = async (
  req,
  res
) => {

  try {

    const results = await Result.find({
      exam: req.params.examId,
    })
      .populate("student", "name email")
      .populate("exam", "title duration totalMarks");

    res.status(200).json(results);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// GET MY RESULTS (Student)
const getMyResults = async (req, res) => {

  try {

    const results = await Result.find({
      student: req.user._id,
    })
      .populate("exam", "title description duration totalMarks createdAt")
      .sort({ submittedAt: -1 });

    res.status(200).json(results);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// GET RESULT BY ID (Student - own result only)
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("exam", "title description duration totalMarks createdAt")
      .populate("student", "name email");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    // Ensure student can only view their own result
    if (result.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Fetch questions for this exam to show question-level breakdown
    const questions = await Question.find({ exam: result.exam._id });

    res.status(200).json({
      ...result.toObject(),
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getAllResults,
  getResultsByExam,
  getMyResults,
  getResultById,
};