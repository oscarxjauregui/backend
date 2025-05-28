// src/context/VuelosContext.jsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react"; // <--- Importa useCallback
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
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // --- APLICAR useCallback a fetchVuelos ---

  const fetchVuelos = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("[VuelosContext] Iniciando fetchVuelos...");

    try {
      const res = await getVuelosRequest();
      console.log("[VuelosContext] Respuesta de getVuelosRequest:", res);

      if (res && Array.isArray(res.data)) {
        setVuelos(res.data);
        console.log("[VuelosContext] Vuelos obtenidos y seteados:", res.data);
      } else {
        console.warn(
          "[VuelosContext] La API no devolvió un array de vuelos o la respuesta fue inesperada.",
          res
        );
        setVuelos([]);
      }
    } catch (err) {
      console.error("[VuelosContext] Error en fetchVuelos:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los vuelos";
      setError(errorMessage);
      setVuelos([]);
    } finally {
      setLoading(false);
    }
  }, []); // <--- Dependencias vacías, ya que no depende de nada del scope del provider que cambie

  const updateVueloStatus = useCallback(async (id, nuevoEstado) => {
    // <--- También recomendable para esta
    setError(null);
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
      throw err;
    }
  }, []); // <--- Dependencias vacías para updateVueloStatus también

  useEffect(() => {
    fetchVuelos();
  }, [fetchVuelos]); // Aquí ahora sí, es seguro usar fetchVuelos como dependencia porque está memoizada

  return (
    <VuelosContext.Provider
      value={{
        vuelos,
        loading,
        error,
        fetchVuelos,
        updateVueloStatus,
      }}
    >
      {children}
    </VuelosContext.Provider>
  );
};
