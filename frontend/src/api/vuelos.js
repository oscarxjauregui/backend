// src/api/vuelos.js
import axios from "./axios";

export const getVuelosRequest = () => {
  return axios.get("/vuelos");
};
export const getVueloByIdRequest = (id) => axios.get(`/vuelos/${id}`);

export const getVuelosByDestinoRequest = async (destino) => {
  return axios.get(`/vuelos/destino/${destino}`);
};

// *** AÑADE ESTAS FUNCIONES ***
export const createVueloRequest = (vueloData) =>
  axios.post("/vuelos", vueloData); // Ruta para crear
export const updateVueloRequest = (id, vueloData) =>
  axios.put(`/vuelos/${id}`, vueloData); // Ruta para actualizar por ID

export const updateVueloEstadoRequest = (id, estadoVuelo) =>
  axios.put(`/vuelos/${id}/estado`, estadoVuelo); // Ruta para actualizar por ID

export const deleteVueloRequest = (id) => axios.delete(`/vuelos/${id}`); // Ruta para eliminar por ID
