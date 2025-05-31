import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getReservationById } from "../api/reservaciones";

const TicketContext = createContext();

export const useTicket = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTicket debe ser usado dentro de un TicketProvider");
  }
  return context;
};

export const TicketProvider = ({ children }) => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTicketById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    console.log("TicketContext: Iniciando fetchTicketById para ID:", id);

    try {
      const res = await getReservationById(id);
      console.log("TicketContext: Respuesta completa de la API (res):", res);
      console.log("TicketContext: Datos de la reservación (res.data):", res);

      setTicketData(res);
    } catch (err) {
      console.error(
        "TicketContext: Error al cargar los datos del ticket:",
        err
      );
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error al cargar el ticket.";
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log(
        "TicketContext: Finalizado fetchTicketById. Loading set to false."
      );
    }
  }, []);

  return (
    <TicketContext.Provider
      value={{
        ticketData,
        loading,
        error,
        fetchTicketById,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
