import api from "./axios";

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
