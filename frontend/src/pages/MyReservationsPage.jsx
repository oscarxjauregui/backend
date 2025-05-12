import { useMyReservations } from "../context/MyReservationsContext";
import { Link } from "react-router-dom";

function MyReservationsPage() {
  const { reservations, loading, error, fetchUserReservations } =
    useMyReservations();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-400">Cargando tus reservaciones...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-red-500 mb-4">
          Error al cargar reservaciones: {error}
        </p>
        <button
          onClick={fetchUserReservations} // Permite al usuario reintentar la carga
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Reintentar
        </button>
      </div>
    );
  }
  if (!reservations || reservations.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-xl text-gray-400 mb-4">
          No tienes reservaciones activas.
        </p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Explorar vuelos
        </Link>
      </div>
    );
  }
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
    } catch (error) {
      return "Fecha inválida", error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Mis Reservaciones
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Iteramos sobre TODAS las reservaciones que el usuario tenga */}
        {reservations.map((reservation) => (
          <div
            key={reservation._id}
            className="bg-zinc-800 p-6 rounded-lg shadow-lg text-white flex flex-col justify-between"
          >
            <div>
              {/* Aquí mostramos los detalles del vuelo asociado a esta reservación individual */}
              <h2 className="text-xl font-semibold mb-2">
                Vuelo: {reservation.vueloId.origen} -{" "}
                {reservation.vueloId.destino}
              </h2>
              <p className="text-sm text-gray-300 mb-1">
                Aerolínea:{" "}
                <span className="font-medium">
                  {reservation.vueloId.aerolinea}
                </span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Fecha de Salida:{" "}
                <span className="font-medium">
                  {formatDate(reservation.vueloId.fechaSalida)}
                </span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Asientos Reservados:{" "}
                <span className="font-medium">{reservation.asientos}</span>
              </p>
              <p className="text-lg font-bold text-emerald-400 mt-2">
                Costo por asiento: $
                {reservation.vueloId.costo
                  ? reservation.vueloId.costo.toFixed(2)
                  : "N/A"}
              </p>
              <p className="text-lg font-bold text-emerald-400">
                Costo Total Reserva: $
                {(
                  (reservation.vueloId.costo || 0) * reservation.asientos
                ).toFixed(2)}
              </p>
              {/* Puedes añadir más detalles del vuelo o de la reservación aquí */}
            </div>
            {/* Aquí podrías añadir un botón para cancelar la reservación, si ya implementaste esa funcionalidad */}
            {/* <button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Cancelar Reserva
            </button> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyReservationsPage;
