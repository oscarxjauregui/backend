import axios from "./axios";

export const getVuelosRequest = () => {
  return axios.get("/vuelos");
};
export const getVueloByIdRequest = (id) => axios.get(`/vuelos/${id}`);

export const getVuelosByDestinoRequest = async (destino) => {
  return axios.get(`/vuelos/destino/${destino}`);
};

export const createVueloRequest = (vueloData) =>
  axios.post("/vuelos", vueloData); 
export const updateVueloRequest = (id, vueloData) =>
  axios.put(`/vuelos/${id}`, vueloData); 

export const updateVueloEstadoRequest = (id, estadoVuelo) =>
  axios.put(`/vuelos/${id}/estado`, estadoVuelo); 

export const deleteVueloRequest = (id) => axios.delete(`/vuelos/${id}`); 
