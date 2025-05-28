// src/context/VuelosContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { getVuelosRequest, updateVueloEstadoRequest } from "../api/vuelos";

const VuelosContext = createContext();

export const useVuelos = () => {
  const context = useContext(VuelosContext);
  if (!context) {
    throw new Error("useVuelos debe ser usado dentro de un VuelosProvider");
  }
  return context;
};

export const VuelosProvider = ({ children }) => {
  const [vuelos, setVuelos] = useState([]); // Inicializado como array vacío
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVuelos = async () => {
    setLoading(true); // Inicia carga
    setError(null); // Limpia errores previos
    console.log("[VuelosContext] Iniciando fetchVuelos...");

    try {
      const res = await getVuelosRequest();
      console.log("[VuelosContext] Respuesta de getVuelosRequest:", res);

      if (res && Array.isArray(res.data)) {
        // Asegurarse de que res.data es un array
        setVuelos(res.data);
        console.log("[VuelosContext] Vuelos obtenidos y seteados:", res.data);
      } else {
        console.warn(
          "[VuelosContext] La API no devolvió un array de vuelos o la respuesta fue inesperada.",
          res
        );
        setVuelos([]); // Asegurarse de que sea un array vacío si no es válido
      }
    } catch (err) {
      console.error("[VuelosContext] Error en fetchVuelos:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los vuelos";
      setError(errorMessage);
      setVuelos([]); // Asegura que vuelos sea un array vacío en caso de error
    } finally {
      setLoading(false); // Finaliza carga
    }
  };

  const updateVueloStatus = async (id, nuevoEstado) => {
    setError(null); // Limpia errores previos de actualización
    try {
      const res = await updateVueloEstadoRequest(id, { estado: nuevoEstado });
      console.log("[VuelosContext] Vuelo actualizado en backend:", res.data);

      setVuelos((prevVuelos) =>
        prevVuelos.map((vuelo) =>
          vuelo._id === id ? { ...vuelo, estado: nuevoEstado } : vuelo
        )
      );
      return res.data;
    } catch (err) {
      console.error(
        "[VuelosContext] Error al actualizar estado de vuelo:",
        err
      );
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar el estado del vuelo.";
      setError(errorMessage);
      throw err; // Propaga el error para manejo en el componente
    }
  };

  useEffect(() => {
    fetchVuelos();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  return (
    <VuelosContext.Provider
      value={{
        vuelos,
        loading,
        error,
        fetchVuelos, // Para recargar vuelos si es necesario
        updateVueloStatus,
      }}
    >
      {children}
    </VuelosContext.Provider>
  );
};
