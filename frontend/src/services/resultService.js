import API from "./api";


export const getAllResults = async () => {

  const response = await API.get("/results");

  return response.data;
};

export const getResultsByExam = async (examId) => {

  const response = await API.get(`/results/exam/${examId}`);

  return response.data;
};


// GET MY RESULTS (Student)
export const getMyResults = async () => {

  const response = await API.get("/results/my");

  return response.data;
};

// GET SINGLE RESULT BY ID
export const getResultById = async (resultId) => {

  const response = await API.get(`/results/${resultId}`);

  return response.data;
};