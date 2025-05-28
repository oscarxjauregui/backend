import { useEffect, useCallback } from "react";
import { useMyReservations } from "../context/MyReservationsContext";
import { Link } from "react-router-dom";

function MyReservationsPage() {
  const { reservations, loading, error, fetchUserReservations } =
    useMyReservations();

  useEffect(() => {
    fetchUserReservations();
  }, [fetchUserReservations]);

  const formatDate = useCallback((dateString) => {
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

      let date;
      date = new Date(dateString);

      if (
        isNaN(date.getTime()) &&
        dateString.includes("/") &&
        dateString.includes(" ")
      ) {
        const [datePart, timePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("/");
        date = new Date(`${year}-${month}-${day}T${timePart}:00`);
      } else if (isNaN(date.getTime()) && dateString.includes("/")) {
        const [day, month, year] = dateString.split("/");
        date = new Date(`${year}-${month}-${day}`);
      }

      if (!isNaN(date.getTime())) {
        return date.toLocaleString("es-ES", options);
      }
      return "Fecha inválida";
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Fecha inválida";
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16 justify-center items-center">
        <p className="text-xl text-gray-600">Cargando tus reservaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16 justify-center items-center">
        <p className="text-xl text-red-600 mb-4">
          Error al cargar reservaciones: {error}
        </p>
        <button
          onClick={fetchUserReservations}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 transition duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16 justify-center items-center">
        <p className="text-xl text-gray-600 mb-4">
          No tienes reservaciones activas.
        </p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Explorar vuelos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16">
      <main className="flex-grow container mx-auto px-6 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Mis Reservaciones
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <div
              key={reservation._id}
              className="bg-gray-100 p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  Vuelo: {reservation.vueloId.origen} -{" "}
                  {reservation.vueloId.destino}
                </h2>
                <p className="text-sm text-gray-700 mb-1">
                  Aerolínea:{" "}
                  <span className="font-medium">
                    {reservation.vueloId.aerolinea}
                  </span>
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  Fecha de Salida:{" "}
                  <span className="font-medium">
                    {formatDate(reservation.vueloId.fechaSalida)}
                  </span>
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  Asientos Reservados:{" "}
                  <span className="font-medium text-lg text-blue-600">
                    {reservation.asientos}
                  </span>
                </p>
                <p className="text-lg font-bold text-emerald-600 mt-2">
                  Costo por asiento: ${" "}
                  {reservation.vueloId.costo
                    ? reservation.vueloId.costo.toFixed(2)
                    : "N/A"}{" "}
                  MXN
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  Costo Total Reserva: $
                  {(
                    (reservation.vueloId.costo || 0) * reservation.asientos
                  ).toFixed(2)}
                  MXN
                </p>
              </div>
              <div className="mt-4">
                <Link
                  to={`/myreservations/${reservation._id}/ticket`}
                  className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                >
                  Ver Ticket
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="bg-gray-900 text-white text-center py-6">
        <p className="text-lg">
          ¿Tienes dudas? Escríbenos a contacto@aerolinea.com
        </p>
        <p className="text-sm mt-2">
          &copy; {new Date().getFullYear()} Aerolínea. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
}

export default MyReservationsPage;
