const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
  },

  score: Number,

  totalQuestions: Number,

  percentage: Number,

  submittedAt: {
    type: Date,
    default: Date.now,
  },

  timeTaken: Number,

  violations: {
    type: Number,
    default: 0,
  },

  answers: [
    {
      questionId: String,
      selectedAnswer: String,
    },
  ],
});

module.exports = mongoose.model("Result", resultSchema);