import { useEffect, useCallback } from "react";
import { useMyReservations } from "../context/MyReservationsContext";
import { Link } from "react-router-dom";

function MyReservationsPage() {
  // Asegúrate de que los nombres aquí coincidan con lo que tu MyReservationsContext exporta
  const { reservations, loading, error, fetchUserReservations } =
    useMyReservations();

  useEffect(() => {
    // Este efecto se ejecutará cada vez que fetchUserReservations cambie (que es raro, gracias a useCallback)
    // o cuando el componente se monte inicialmente.
    fetchUserReservations();
  }, [fetchUserReservations]); // Dependencia correcta para useCallback

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
      // Intenta parsear directamente
      date = new Date(dateString);

      // Lógica de fallback para formatos específicos (si realmente son necesarios)
      if (
        isNaN(date.getTime()) && // Si la primera conversión falló
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
      return "Fecha inválida"; // Si ninguna conversión funciona
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Fecha inválida";
    }
  }, []); // Dependencia vacía para useCallback, ya que no usa variables externas que cambien

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16 justify-center items-center">
        <p className="text-xl text-gray-600">Cargando tus reservaciones...</p>
      </div>
    );
  }

  if (error) {
    // Asegurarse de que 'error' sea un string o un objeto con un mensaje
    const errorMessage =
      typeof error === "string" ? error : error.message || "Error desconocido";
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16 justify-center items-center">
        <p className="text-xl text-red-600 mb-4">
          Error al cargar reservaciones: {errorMessage}
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
          {reservations.map((reservation) => {
            // --- ¡DEBUGGING CRÍTICO AQUÍ! ---
            console.log("Procesando reservación:", reservation);
            console.log(
              "reservation.vueloId (antes de usarlo):",
              reservation.vueloId
            );
            // ----------------------------------

            const vuelo = reservation.vueloId;

            // --- CHEQUEOS DEFENSIVOS APLICADOS ---
            // Verifica que 'vuelo' exista, sea un objeto y tenga las propiedades 'origen' y 'destino'
            if (
              !vuelo ||
              typeof vuelo !== "object" ||
              !vuelo.origen ||
              !vuelo.destino ||
              !vuelo.aerolinea ||
              !vuelo.fechaSalida ||
              typeof reservation.asientos === "undefined" || // También revisa si asientos está presente
              typeof vuelo.costo === "undefined" // Revisa si costo está presente
            ) {
              console.warn(
                `Datos de vuelo o reservación incompletos o incorrectos para reservación ID: ${reservation._id}. Datos recibidos:`,
                reservation
              );
              return (
                <div
                  key={reservation._id}
                  className="bg-gray-100 p-6 rounded-2xl shadow-md border border-red-400 flex flex-col justify-between"
                >
                  <h2 className="text-xl font-semibold mb-2 text-red-700">
                    Error al mostrar esta reservación
                  </h2>
                  <p className="text-sm text-gray-700 mb-1">
                    ID de Reservación:{" "}
                    <span className="font-medium">{reservation._id}</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    Estado de Reservación:{" "}
                    <span className="font-medium">
                      {reservation.estadoReservacion || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    Detalles del vuelo faltantes o inválidos.
                  </p>
                </div>
              );
            }

            return (
              <div
                key={reservation._id}
                className="bg-gray-100 p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">
                    Vuelo: {vuelo.origen} -{" "}
                    {/* Usamos 'vuelo' que ya es el objeto poblado */}
                    {vuelo.destino}
                  </h2>
                  <p className="text-sm text-gray-700 mb-1">
                    Aerolínea:{" "}
                    <span className="font-medium">{vuelo.aerolinea}</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    Fecha de Salida:{" "}
                    <span className="font-medium">
                      {formatDate(vuelo.fechaSalida)}
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
                    {vuelo.costo
                      ? vuelo.costo.toFixed(2) // Aseguramos que 'costo' es un número
                      : "N/A"}{" "}
                    USD
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    Costo Total Reserva: $
                    {((vuelo.costo || 0) * reservation.asientos).toFixed(2)}
                    USD
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
            );
          })}
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
