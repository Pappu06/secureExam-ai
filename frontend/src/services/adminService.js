import API from "./api";


export const updateExam = async (examId, examData) => {

  const response = await API.put(
    `/exams/${examId}`,
    examData
  );

  return response.data;
};

export const deleteExam = async (examId) => {

  const response = await API.delete(`/exams/${examId}`);

  return response.data;
};

export const getAdminStats = async () => {

  const response = await API.get("/admin/stats");

  return response.data;
};

export const sendAdminChatMessage = async (messages) => {

  const response = await API.post("/admin/chat", { messages });

  return response.data;
};