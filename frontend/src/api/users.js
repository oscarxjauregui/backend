import axios from "./axios";

// Para obtener solo los nombres/datos de los capitanes (pilotos)
export const getCapitanesRequest = () => {
  return axios.get(`/pilotos`);
};

// Para obtener solo los nombres/datos de las azafatas
export const getAzafatasRequest = () => {
  return axios.get(`/azafatas`);
};

// Obtener TODOS los usuarios
export const getUsersRequest = () => axios.get("/getUsers");

// Crear un nuevo usuario
export const createUserRequest = (userData) =>
  axios.post("/createUser", userData);

// Actualizar un usuario existente
export const updateUserRequest = (id, userData) =>
  axios.put(`/users/${id}/upload`, userData);

// Eliminar un usuario
export const deleteUserRequest = (id) => axios.delete(`/deleteUser/${id}`);
