import axiosInstance from "./axiosInstance";

export const registerUser = async (email, password, password2) => {
  const response = await axiosInstance.post("accounts/register/", {
    email,
    password,
    password2,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axiosInstance.post("accounts/login/", {
    email,
    password,
  });
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post("accounts/logout/");
  return response.data;
};

export const getUserInfo = async () => {
  try {
    const response = await axiosInstance.get("accounts/user/");
    return response.data;
  } catch (error) {
    console.error("Me failed", error.response?.data || error.message);
    return null;
  }
};

export const refreshToken = async () => {
  const response = await axiosInstance.post("accounts/refresh/");
  console.log("refreshToken disparado");

  return response.data;
};
