import axios from "./axios";

export const getVuelosRequest = () => {
  return axios.get("/vuelos");
};
export const getVueloByIdRequest = (id) => axios.get(`/vuelos/${id}`);
