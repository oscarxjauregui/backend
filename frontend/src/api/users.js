// src/api/user.js
import axios from "./axios"; // Asegúrate de que este axios sea tu instancia configurada con baseURL

// Para obtener solo los nombres de los capitanes (pilotos)
export const getCapitanesRequest = () => {
  return axios.get(`/pilotos`); // Llama a la ruta '/api/capitanes' en tu backend
};

// Para obtener solo los nombres de las azafatas
export const getAzafatasRequest = () => {
  return axios.get(`/azafatas`); // Llama a la ruta '/api/azafatas-vuelo' en tu backend
};

// ** Puedes mantener las siguientes funciones si las usas en otras partes de tu frontend **

// Si necesitas la función getUsersByRoleRequest para otros propósitos, mantenla
// export const getUsersByRoleRequest = (role) => axios.get(`/getUsersByRole/${role}`);

// Funciones CRUD de usuarios (si las usas en el frontend para gestión general de usuarios)
export const getUsersRequest = () => axios.get("/users");
export const createUserRequest = (user) => axios.post("/users", user);
export const updateUserRequest = (id, user) => axios.put(`/users/${id}`, user);
export const deleteUserRequest = (id) => axios.delete(`/users/${id}`);
