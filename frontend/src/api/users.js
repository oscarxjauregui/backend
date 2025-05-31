import axios from "./axios";

export const getCapitanesRequest = () => {
  return axios.get(`/pilotos`);
};

export const getAzafatasRequest = () => {
  return axios.get(`/azafatas`);
};

export const getUsersRequest = () => axios.get("/getUsers");

export const createUserRequest = (userData) =>
  axios.post("/createUser", userData);

export const updateUserRequest = (id, userData) =>
  axios.put(`/users/${id}/upload`, userData);

export const deleteUserRequest = (id) => axios.delete(`/deleteUser/${id}`);
