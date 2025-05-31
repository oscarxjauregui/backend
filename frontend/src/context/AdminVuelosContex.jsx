import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  getVuelosRequest,
  createVueloRequest,
  updateVueloRequest,
  deleteVueloRequest,
} from "../api/vuelos";

const AdminVuelosContext = createContext();

export const useAdminVuelos = () => {
  const context = useContext(AdminVuelosContext);
  if (!context) {
    throw new Error(
      "useAdminVuelos debe ser usado dentro de un AdminVuelosProvider"
    );
  }
  return context;
};

export const AdminVuelosProvider = ({ children }) => {
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminVuelos = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("[AdminVuelosContext] Iniciando fetchAdminVuelos...");

    try {
      const res = await getVuelosRequest();

      if (res && res.data) {
        setVuelos(res.data);
        console.log("[AdminVuelosContext] Vuelos obtenidos:", res.data);
      } else {
        console.error(
          "[AdminVuelosContext] La respuesta de la API o res.data es undefined o null",
          res
        );
        throw new Error("Respuesta inesperada del servidor al cargar vuelos.");
      }
    } catch (err) {
      console.error("[AdminVuelosContext] Error al cargar vuelos:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar los vuelos administrativos.";
      setError(errorMessage);
      setVuelos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAdminVuelo = useCallback(
    async (vueloData) => {
      setLoading(true);
      setError(null);
      try {
        const res = await createVueloRequest(vueloData);
        if (res.status === 201 || res.status === 200) {
          await fetchAdminVuelos();
          return { success: true, message: "Vuelo creado exitosamente." };
        }
        return { success: false, message: "Error al crear el vuelo." };
      } catch (err) {
        console.error("[AdminVuelosContext] Error al crear vuelo:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "Error al crear vuelo.";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [fetchAdminVuelos]
  );

  const updateAdminVuelo = useCallback(
    async (id, vueloData) => {
      setLoading(true);
      setError(null);
      try {
        const res = await updateVueloRequest(id, vueloData);
        if (res.status === 200) {
          await fetchAdminVuelos();

          return { success: true, message: "Vuelo actualizado exitosamente." };
        }
        return { success: false, message: "Error al actualizar el vuelo." };
      } catch (err) {
        console.error("[AdminVuelosContext] Error al actualizar vuelo:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al actualizar vuelo.";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [fetchAdminVuelos]
  );

  const deleteAdminVuelo = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const res = await deleteVueloRequest(id);
        if (res.status === 204 || res.status === 200) {
          await fetchAdminVuelos();
          return { success: true, message: "Vuelo eliminado exitosamente." };
        }
        return { success: false, message: "Error al eliminar el vuelo." };
      } catch (err) {
        console.error("[AdminVuelosContext] Error al eliminar vuelo:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al eliminar vuelo.";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [fetchAdminVuelos]
  );

  useEffect(() => {
    fetchAdminVuelos();
  }, [fetchAdminVuelos]);

  const contextValue = {
    vuelos,
    loading,
    error,
    fetchAdminVuelos,
    createAdminVuelo,
    updateAdminVuelo,
    deleteAdminVuelo,
  };

  return (
    <AdminVuelosContext.Provider value={contextValue}>
      {children}
    </AdminVuelosContext.Provider>
  );
};
