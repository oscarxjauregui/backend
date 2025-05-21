// src/context/UserContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getCapitanesRequest, getAzafatasRequest } from "../api/users"; // ¡Asegúrate de que la ruta de importación sea '../api/user' y no '../api/users'!

const UserContext = createContext();

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // Ahora almacenarán arrays de objetos de usuario completos
  const [pilotos, setPilotos] = useState([]);
  const [azafatas, setAzafatas] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  // Asegúrate de usar useCallback para memoizar la función
  const loadStaffData = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const pilotosRes = await getCapitanesRequest();
      const azafatasRes = await getAzafatasRequest();

      // Guardar los objetos de usuario completos directamente en el estado
      setPilotos(pilotosRes.data);
      setAzafatas(azafatasRes.data);

      console.log("Pilotos cargados (objetos completos):", pilotosRes.data);
      console.log("Azafatas cargadas (objetos completos):", azafatasRes.data);
    } catch (err) {
      console.error("Error loading staff data:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar el personal (pilotos/azafatas).";
      setErrorUsers(errorMessage);
    } finally {
      setLoadingUsers(false);
    }
  }, []); // Dependencias vacías para useCallback para que la función sea estable

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]); // Depende de la función memoizada, que solo cambia si sus propias dependencias internas cambian.

  return (
    <UserContext.Provider
      value={{
        pilotos, // Ahora es un array de objetos de usuario
        azafatas, // Ahora es un array de objetos de usuario
        loadingUsers,
        errorUsers,
        loadStaffData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
