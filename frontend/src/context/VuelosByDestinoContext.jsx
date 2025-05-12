import { createContext, useContext, useState, useCallback } from "react";

import { getVuelosByDestinoRequest } from "../api/vuelos";

const VuelosByDestinoContext = createContext();

export const useVuelosByDestino = () => {
  const context = useContext(VuelosByDestinoContext);
  if (!context) {
    throw new Error(
      "useVuelosByDestino debe ser usado dentro de un VuelosByDestinoProvider"
    );
  }
  return context;
};

export const VuelosByDestinoProvider = ({ children }) => {
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);

  const fetchVuelosByDestino = useCallback(async (destino) => {
    if (!destino) {
      setError("El destino no puede estar vacío.");
      setVuelos([]);
      setNoResults(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNoResults(false);

    console.log(
      `[VuelosByDestinoContext] Iniciando fetchVuelosByDestino para el destino: ${destino}`
    );
    try {
      const res = await getVuelosByDestinoRequest(destino);
      if (res && res.data) {
        if (res.data.length === 0) {
          console.log(
            `[VuelosByDestinoContext] No se encontraron vuelos para el destino: ${destino}`
          );
          setVuelos([]);
          setNoResults(true);
        } else {
          setVuelos(res.data);
          console.log("[VuelosByDestinoContext] Vuelos obtenidos:", res.data);
        }
      } else {
        console.error(
          "[VuelosByDestinoContext] API devolvió respuesta inesperada para el destino",
          destino,
          res
        );
        setError(
          "Respuesta inesperada del servidor al buscar vuelos por destino."
        );
        setVuelos([]);
      }
    } catch (err) {
      console.error(
        `[VuelosByDestinoContext] Error al obtener vuelos por destino ${destino}:`,
        err
      );
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        `Error desconocido al cargar vuelos para el destino ${destino}.`;

      if (err.response?.status === 404) {
        setError(null);
        setNoResults(true);
        setVuelos([]);
        console.log(
          `[VuelosByDestinoContext] No se encontraron vuelos (404) para el destino: ${destino}`
        );
      } else {
        setError(errorMessage);
        setVuelos([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearVuelos = useCallback(() => {
    setVuelos([]);
    setError(null);
    setNoResults(false);
    setLoading(false);
  }, []);

  const contextValue = {
    vuelos,
    loading,
    error,
    noResults,
    fetchVuelosByDestino,
    clearVuelos,
  };

  return (
    <VuelosByDestinoContext.Provider value={contextValue}>
      {children}
    </VuelosByDestinoContext.Provider>
  );
};
