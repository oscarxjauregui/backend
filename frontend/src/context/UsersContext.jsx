// src/context/UsersContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCapitanesRequest,
  getAzafatasRequest,
  getUsersRequest, // NUEVO: Importación para obtener todos los usuarios
  createUserRequest, // NUEVO: Importación para crear usuarios
  updateUserRequest, // NUEVO: Importación para actualizar usuarios
  deleteUserRequest, // NUEVO: Importación para eliminar usuarios
} from "../api/users"; // Asegúrate de que esta ruta sea correcta

const UsersContext = createContext();

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers debe usarse dentro de un UsersProvider");
  }
  return context;
};

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]); // NUEVO: Estado para almacenar todos los usuarios
  const [pilotos, setPilotos] = useState([]);
  const [azafatas, setAzafatas] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  // Función para cargar todos los datos de usuario (incluido el personal)
  const loadAllUsersData = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const allUsersRes = await getUsersRequest(); // Obtener todos los usuarios
      setUsers(allUsersRes.data);

      // Filtrar pilotos y azafatas de la lista completa para casos de uso específicos
      setPilotos(allUsersRes.data.filter((user) => user.rol === "Piloto"));
      setAzafatas(allUsersRes.data.filter((user) => user.rol === "Azafata"));

      console.log("Todos los usuarios cargados:", allUsersRes.data);
    } catch (err) {
      console.error("Error al cargar datos de usuario:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar usuarios y personal.";
      setErrorUsers(errorMessage);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // NUEVO: Operaciones CRUD para usuarios generales
  const createUser = async (userData) => {
    try {
      const res = await createUserRequest(userData);
      loadAllUsersData(); // Recargar todos los usuarios para asegurar la consistencia
      return { success: true, message: "Usuario creado exitosamente" };
    } catch (err) {
      console.error("Error al crear usuario:", err);
      const errorMessage =
        err.response?.data?.message || "Error al crear usuario";
      setErrorUsers(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const res = await updateUserRequest(id, userData);
      loadAllUsersData(); // Recargar todos los usuarios para asegurar la consistencia
      return { success: true, message: "Usuario actualizado exitosamente" };
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      const errorMessage =
        err.response?.data?.message || "Error al actualizar usuario";
      setErrorUsers(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await deleteUserRequest(id);
      if (res.status === 200) {
        loadAllUsersData(); // Recargar todos los usuarios para asegurar la consistencia
        return { success: true, message: "Usuario eliminado exitosamente" };
      }
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      const errorMessage =
        err.response?.data?.message || "Error al eliminar usuario";
      setErrorUsers(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  useEffect(() => {
    loadAllUsersData();
  }, [loadAllUsersData]);

  return (
    <UsersContext.Provider
      value={{
        users, // Ahora proporciona todos los usuarios
        pilotos,
        azafatas,
        loadingUsers,
        errorUsers,
        createUser, // NUEVO
        updateUser, // NUEVO
        deleteUser, // NUEVO
        loadAllUsersData, // Permite que los componentes externos refresquen los datos
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
