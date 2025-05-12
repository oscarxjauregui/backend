import api from "./axios";
import { useVuelosByDestino } from "../context/VuelosByDestinoContext";

export const createReservacion = async (vueloId, asientos) => {
  try {
    const response = await api.post(`/reservaciones/${vueloId}`, { asientos });
    return response.data;
  } catch (error) {
    console.error(
      "Error al crear la reserva:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      "Error desconocido al procesar la reserva"
    );
  }
};

export const getUserReservaciones = async () => {
  try {
    const response = await api.get("/reservaciones");
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener las reservaciones del usuario:",
      error.response?.data || error.message
    );
    throw error.response?.data?.message || "Error al obtener tus reservaciones";
  }
};
