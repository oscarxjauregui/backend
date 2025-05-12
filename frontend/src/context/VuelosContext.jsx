import React, { createContext, useState, useContext, useEffect } from "react";

import { getVuelosRequest } from "../api/vuelos";

const VuelosContext = createContext();

export const useVuelos = () => {
  const context = useContext(VuelosContext);
  if (!context) {
    throw new Error("useVuelos debe ser usado dentro de un VueloProvider");
  }
  return context;
};

export const VuelosProvider = ({ children }) => {
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVuelos = async () => {
    setLoading(true);
    setError(null);
    console.log("[VuelosContext] Iniciando fetchVuelos...");

    try {
      const res = await getVuelosRequest();

      if (res && res.data) {
        setVuelos(res.data);
        console.log("[VuelosContext] Vuelos obtenidos:", res.data);
      } else {
        console.error(
          "[VuelosContext] La respuesta de la api o res.data es undefined o null",
          res
        );
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los vuelos";
      setError(errorMessage);
      setVuelos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVuelos();
  }, []);
  return (
    <VuelosContext.Provider
      value={{
        vuelos,
        loading,
        error,
        fetchVuelos,
      }}
    >
      {children}
    </VuelosContext.Provider>
  );
};
