// src/context/MyReservationsContext.jsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getUserReservaciones, // <-- Esta es la función de tu api
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
      // Si getUserReservaciones devuelve directamente el array de reservaciones
      const userReservationsArray = await getUserReservaciones(); 
      
      // Comprueba si el resultado es un array
      if (Array.isArray(userReservationsArray)) {
        setReservations(userReservationsArray); // <-- ¡Cambio aquí!
      } else {
        console.warn("getUserReservaciones no devolvió un array. Reiniciando a vacío.");
        setReservations([]);
      }
    } catch (err) {
      console.error("Error fetching user reservations:", err);
      const errorMessage = err.response?.data?.message || err.message || "Error al cargar tus reservaciones.";
      setError(errorMessage);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUserReservations();
  }, [fetchUserReservations]); // Ya corregido

  const cancelReservation = useCallback(async (reservationId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await cancelReservationRequest(reservationId);
      fetchUserReservations();
      return res.data;
    } catch (err) {
      console.error(`Error cancelling reservation ${reservationId}:`, err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "No se pudo cancelar la reservación.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUserReservations]);

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