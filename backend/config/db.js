const mongoose = require("mongoose");
const Exam = require("../models/Exam");


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await ensureExamIndexes();

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};


const ensureExamIndexes = async () => {
  const indexes = await Exam.collection.indexes();
  const examCodeIndex = indexes.find((index) => index.name === "examCode_1");

  if (examCodeIndex && (!examCodeIndex.sparse || !examCodeIndex.unique)) {
    await Exam.collection.dropIndex("examCode_1");
  }

  await Exam.collection.createIndex(
    { examCode: 1 },
    { unique: true, sparse: true, name: "examCode_1" }
  );
};



module.exports = connectDB;
