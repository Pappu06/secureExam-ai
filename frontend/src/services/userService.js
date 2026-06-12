import API from "./api";


// GET PROFILE
export const getProfile = async () => {

  const response = await API.get("/users/profile");

  return response.data;
};


// UPDATE PROFILE
export const updateProfile = async (data) => {

  const response = await API.put("/users/profile", data);

  return response.data;
};


// CHANGE PASSWORD
export const changePassword = async (data) => {

  const response = await API.put("/users/change-password", data);

  return response.data;
};
