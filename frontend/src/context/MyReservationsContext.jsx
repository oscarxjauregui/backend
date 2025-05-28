import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  getUserReservaciones,
  cancelReservationRequest,
} from "../api/reservaciones";
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
  }, [isAuthenticated]);

  const contextValue = useMemo(
    () => ({
      reservations,
      loading,
      error,
      fetchUserReservations,
    }),
    [reservations, loading, error, fetchUserReservations]
  );

  // Nueva función para cancelar una reservación
  const cancelReservation = useCallback(async (reservationId) => {
    setLoading(true); // O puedes manejar un loading específico para la cancelación
    setError(null);
    try {
      const res = await cancelReservationRequest(reservationId);
      // Opcional: Si el backend devuelve la reserva actualizada, puedes actualizar el estado aquí
      // setReservations(prevReservations => prevReservations.map(
      //   res => res._id === reservationId ? { ...res, estado: 'cancelada' } : res
      // ));
      return res.data; // Devuelve la respuesta del backend
    } catch (err) {
      console.error(`Error cancelling reservation ${reservationId}:`, err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "No se pudo cancelar la reservación.";
      setError(errorMessage);
      throw new Error(errorMessage); // Propagar el error para que MyReservationsPage lo maneje
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <MyReservationsContext.Provider
      value={{
        reservations,
        loading,
        error,
        fetchUserReservations,
        cancelReservation, 
      }}
    >
      {children}
    </MyReservationsContext.Provider>
  );
};
