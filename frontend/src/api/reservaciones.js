import axios from "./axios";

export const getUserReservaciones = async () => {
  try {
    const response = await axios.get("/reservaciones");
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
    const res = await axios.get(`/reservaciones/${id}`); // Asegúrate de que esta ruta sea correcta para tu backend
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

export const createReservacionRequest = async (vueloId, data) => {
  // 'data' DEBE SER UN OBJETO como { asientos: 2 }
  // console.log para depuración:
  console.log(`Enviando POST a /reservaciones/${vueloId} con datos:`, data);
  try {
    const response = await axios.post(`/reservaciones/${vueloId}`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Error al crear la reserva (createReservacionRequest):", // Mensaje más específico
      error.response?.data || error.message
    );
    throw (
      error.response?.data?.message ||
      "Error desconocido al procesar la reserva"
    );
  }
};

export const cancelReservationRequest = async (reservacionId) => {
  try {
    const res = await axios.delete(`/reservaciones/${reservacionId}`); // <--- Llama a la ruta DELETE del backend
    return res.data;
  } catch (error) {
    console.error(
      `Error en la solicitud de cancelación para ${reservacionId}:`,
      error
    );
    if (error.response) {
      throw new Error(
        error.response.data.message ||
          error.response.data ||
          "Error del servidor al cancelar la reservación."
      );
    } else if (error.request) {
      throw new Error(
        "No se recibió respuesta del servidor. Verifica tu conexión."
      );
    } else {
      throw new Error(
        error.message ||
          "Error desconocido al intentar cancelar la reservación."
      );
    }
  }
};
