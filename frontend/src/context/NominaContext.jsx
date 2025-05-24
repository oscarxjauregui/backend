import { createContext, useContext, useState } from "react";
import {
  getNominaPilotosRequest,
  getNominaAzafatasRequest,
} from "../api/nomina";

const NominaContext = createContext();

export const useNomina = () => {
  const context = useContext(NominaContext);
  if (!context) {
    throw new Error("useNomina debe ser usado dentro de un NominaProvider");
  }
  return context;
};

export const NominaProvider = ({ children }) => {
  const [nominaPilotos, setNominaPilotos] = useState([]);
  const [nominaAzafatas, setNominaAzafatas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNomina = async (mes, anio) => {
    setLoading(true);
    setError(null);
    setNominaPilotos([]);
    setNominaAzafatas([]);

    try {
      // Fetch nómina de pilotos
      const resPilotos = await getNominaPilotosRequest(mes, anio);
      if (Array.isArray(resPilotos.data)) {
        setNominaPilotos(resPilotos.data);
      } else {
        console.warn(
          "La respuesta de pilotos no es un array:",
          resPilotos.data
        );
        setNominaPilotos([]);
      }

      // Fetch nómina de azafatas
      const resAzafatas = await getNominaAzafatasRequest(mes, anio);
      if (Array.isArray(resAzafatas.data)) {
        setNominaAzafatas(resAzafatas.data);
      } else {
        console.warn(
          "La respuesta de azafatas no es un array:",
          resAzafatas.data
        );
        setNominaAzafatas([]);
      }
    } catch (err) {
      console.error("Error al obtener la nómina:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar la nómina.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NominaContext.Provider
      value={{
        nominaPilotos,
        nominaAzafatas,
        loading,
        error,
        fetchNomina,
      }}
    >
      {children}
    </NominaContext.Provider>
  );
};
