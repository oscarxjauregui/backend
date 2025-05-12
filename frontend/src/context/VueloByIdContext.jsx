import { createContext, useContext, useState, useCallback } from "react";
import { getVueloByIdRequest } from "../api/vuelos";

const VueloContext = createContext();

export const useVuelo = () => {
  const context = useContext(VueloContext);
  if (!context) {
    throw new Error("useVuelo debe ser usado dentro de un VueloProvider");
  }
  return context;
};

export const VueloProvider = ({ children }) => {
  const [vuelo, setVuelo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchVueloById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setVuelo(null);

    console.log(`[VueloContext] Iniciando la fetchVueloById para el id: ${id}`);
    try {
      const res = await getVueloByIdRequest(id);
      if (res && res.data) {
        setVuelo(res.data);
        console.log("[VueloContext] Vuelo obtenido:", res.data);
      } else {
        console.error(
          "[VueloContext] Api devolvio respuesta sin datos para Id",
          id,
          res
        );
        throw new Error("No se encontraron detalles del vuelo");
      }
    } catch (err) {
      console.error(`[VueloContext] Error al obtener vuelo ID ${id}:`, err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        `Error desconocido al cargar el vuelo ID ${id}.`;
      if (err.response?.status === 404) {
        setError("Vuelo no encontrado");
      } else {
        setError(errorMessage);
      }
      setVuelo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = {
    vuelo,
    loading,
    error,
    fetchVueloById,
  };

  return (
    <VueloContext.Provider value={contextValue}>
      {children}
    </VueloContext.Provider>
  );
};
