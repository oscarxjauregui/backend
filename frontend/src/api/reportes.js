import axios from "./axios";

export const getWeeklyReportRequest = () => axios.get("/reportes/semanal");
export const getMonthlyReportRequest = () => axios.get("/reportes/mensual");
export const getAnnualReportRequest = () => axios.get("/reportes/anual");
export const getClientReservationsReportRequest = () =>
  axios.get("/reportes/clientes");
