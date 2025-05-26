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

export const getReservationById = async (id) => {
  try {
    const res = await api.get(`/reservaciones/${id}`); // Asegúrate de que esta ruta sea correcta para tu backend
    return res.data;
  } catch (error) {
    console.error("Error al obtener la reservación por ID:", error);
    if (error.response) {
      throw new Error(
        error.response.data.message ||
          "Error del servidor al obtener la reservación."
      );
    } else if (error.request) {
      throw new Error(
        "No se recibió respuesta del servidor al obtener la reservación."
      );
    } else {
      throw new Error(
        error.message || "Error desconocido al obtener la reservación."
      );
    }
  }
};
