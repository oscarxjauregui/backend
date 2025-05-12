// src/pages/VueloDetailsPage.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useVuelo } from "../context/VueloByIdContext";
import { useAuth } from "../context/AuthContext";
import { createReservacion } from "../api/reservaciones";

function VueloDetailsPage() {
  const { id } = useParams();
  const { vuelo, loading, error, fetchVueloById } = useVuelo();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [reserving, setReserving] = useState(false);
  const [reservacionError, setReservacionError] = useState(null);
  const [reservacionSuccess, setReservacionSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVueloById(id);
    }
  }, [id, fetchVueloById]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return new Date(dateString).toLocaleString("es-ES", options);
    } catch (e) {
      return "Fecha inválida", e;
    }
  };

  const handleConfirmarReserva = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirectTo=/reservar/${id}&action=confirmar`);
      return;
    }
    if (vuelo.asientosDisponibles <= 0) {
      setReservacionError("No hay asientos disponibles para este vuelo.");
      return;
    }
    setReserving(true);
    setReservacionError(null);
    setReservacionSuccess(false);

    try {
      const asientos = 1;
      await createReservacion(id, asientos);
      setReservacionSuccess(true);
      fetchVueloById(id);
      alert(
        `¡Reserva confirmada para el vuelo ${vuelo.origen} - ${vuelo.destino}!`
      );
    } catch (error) {
      const errorMessage =
        error || "Error al procesar la reserva. Inténtalo de nuevo.";
      setReservacionError(errorMessage);
      console.error("Error en handleConfirmarReserva:", error);
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-400">Cargando detalles del vuelo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-red-500 mb-4">Error: {error}</p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Volver a la lista de vuelos
        </Link>
      </div>
    );
  }

  if (!vuelo) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-400 mb-4">Vuelo no encontrado.</p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Volver a la lista de vuelos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-zinc-800 p-6 md:p-10 rounded-lg shadow-xl text-white max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
          Detalles del Vuelo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-400">Origen:</p>
            <p className="text-xl font-semibold">{vuelo.origen}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Destino:</p>
            <p className="text-xl font-semibold">{vuelo.destino}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Fecha de Salida:</p>
            <p className="text-lg">{formatDate(vuelo.fechaSalida)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Fecha de Llegada:</p>
            <p className="text-lg">{formatDate(vuelo.fechaLlegada)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Aerolínea:</p>
            <p className="text-lg">{vuelo.aerolinea}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Avión:</p>
            <p className="text-lg">{vuelo.avion}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Estado del vuelo:</p>
            <p className="text-lg">{vuelo.estado}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Asientos Disponibles:</p>
            <p
              className={`text-lg font-bold ${
                vuelo.asientosDisponibles > 10
                  ? "text-green-400"
                  : vuelo.asientosDisponibles > 0
                  ? "text-yellow-400"
                  : "text-red-500"
              }`}
            >
              {vuelo.asientosDisponibles}
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-700 pt-6 text-center">
          <p className="text-2xl font-bold text-emerald-400 mb-6">
            Costo Total: ${vuelo.costo ? vuelo.costo.toFixed(2) : "N/A"}
          </p>
          {vuelo.asientosDisponibles > 0 ? (
            <button
              onClick={handleConfirmarReserva}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200 ease-in-out"
            >
              {isAuthenticated
                ? "Confirmar Reserva"
                : "Iniciar Sesión para Reservar"}
            </button>
          ) : (
            <p className="text-red-500 font-semibold text-lg">
              No hay asientos disponibles para este vuelo.
            </p>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 transition duration-150"
          >
            &larr; Volver a la lista de vuelos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VueloDetailsPage;
