import axios from "./axios";

export const getVuelosRequest = () => {
  return axios.get("/vuelos");
};
export const getVueloByIdRequest = (id) => axios.get(`/vuelos/${id}`);

export const getVuelosByDestinoRequest = async (destino) => {
  return axios.get(`/vuelos/destino/${destino}`);
};
