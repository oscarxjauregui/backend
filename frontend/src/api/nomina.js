import axios from "./axios";

export const getNominaPilotosRequest = (mes, anio) =>
  axios.post("/nomina/pilotos", { mes, anio });

export const getNominaAzafatasRequest = (mes, anio) =>
  axios.post("/nomina/azafatas", { mes, anio });
