import API from "./api";


// REGISTER
export const registerUser = async (userData) => {
  const response = await API.post(
    "/auth/register",
    userData
  );

  return response.data;
};


// LOGIN
export const loginUser = async (userData) => {
  const response = await API.post(
    "/auth/login",
    userData
  );

  return response.data;
};


// LOGOUT
export const logoutUser = async () => {
  const response = await API.post("/auth/logout");
  return response.data;
};


// GET CURRENT USER (verify token)
export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};