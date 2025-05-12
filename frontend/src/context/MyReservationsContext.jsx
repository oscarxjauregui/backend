import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getUserReservaciones } from "../api/reservaciones";
import { useAuth } from "./AuthContext";

const MyReservationsContext = createContext();

export const useMyReservations = () => {
  const context = useContext(MyReservationsContext);
  if (!context) {
    throw new Error(
      "useMyReservations debe ser usado dentro de un MyReservationsProvider"
    );
  }
  return context;
};

export const MyReservationsProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  const fetchUserReservations = useCallback(async () => {
    if (!isAuthenticated) {
      setReservations([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getUserReservaciones();
      setReservations(data);
    } catch (error) {
      setError(error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUserReservations();
  }, [fetchUserReservations]);

  const contextValue = useMemo(
    () => ({
      reservations,
      loading,
      error,
      fetchUserReservations,
    }),
    [reservations, loading, error, fetchUserReservations]
  );
  return (
    <MyReservationsContext.Provider value={contextValue}>
      {children}
    </MyReservationsContext.Provider>
  );
};
