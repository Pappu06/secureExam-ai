import API from "./api";


// GET ALL EXAMS
export const getAllExams = async () => {

  const response = await API.get("/exams/all");

  return response.data;
};


// GET EXAM BY ID
export const getExamById = async (id) => {

  const response = await API.get(`/exams/details/${id}`);

  return response.data;
};


// GET QUESTIONS
export const getQuestions = async (examId) => {

  const response = await API.get(`/exams/questions/${examId}`);

  return response.data;
};


// SUBMIT EXAM
export const submitExam = async (examData) => {

  const response = await API.post("/exams/submit", examData);

  return response.data;
};