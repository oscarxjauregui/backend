import { useEffect, useCallback } from "react"; // Importa useEffect y useCallback
import { useMyReservations } from "../context/MyReservationsContext";
import { Link } from "react-router-dom";

// Opcional: Si tu Navbar no es global, impórtala aquí
// import Navbar from "../components/Navbar";

function MyReservationsPage() {
  const { reservations, loading, error, fetchUserReservations } =
    useMyReservations();

  // Usa useEffect para cargar las reservaciones cuando el componente se monta
  useEffect(() => {
    fetchUserReservations();
  }, [fetchUserReservations]); // Dependencia para evitar llamadas infinitas

  // Función para formatear fechas, reutilizada de las otras páginas
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Formato de 12 horas con AM/PM
      };

      let date;
      // Intenta parsear como fecha ISO primero
      date = new Date(dateString);

      // Si falla y parece ser "DD/MM/YYYY HH:mm"
      if (
        isNaN(date.getTime()) &&
        dateString.includes("/") &&
        dateString.includes(" ")
      ) {
        const [datePart, timePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("/");
        // Reconstruye a un formato que `new Date()` pueda parsear mejor (YYYY-MM-DDTHH:mm)
        date = new Date(`${year}-${month}-${day}T${timePart}:00`);
      } else if (isNaN(date.getTime()) && dateString.includes("/")) {
        // Maneja "DD/MM/YYYY" sin tiempo
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

  // --- Renderizado para estados de Carga, Error, Vuelo no encontrado ---
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
          onClick={fetchUserReservations} // Permite al usuario reintentar la carga
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

  // --- Renderizado principal de Mis Reservaciones ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16">
      {" "}
      {/* Agregado pt-16 para Navbar fija */}
      {/* <Navbar /> {/* Descomenta si tu Navbar no es global */}
      <main className="flex-grow container mx-auto px-6 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Mis Reservaciones
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Iteramos sobre TODAS las reservaciones que el usuario tenga */}
          {reservations.map((reservation) => (
            <div
              key={reservation._id}
              className="bg-gray-100 p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between"
            >
              <div>
                {/* Aquí mostramos los detalles del vuelo asociado a esta reservación individual */}
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
                  {" "}
                  {/* Ajustado a emerald-600 para contraste */}
                  Costo por asiento: ${" "}
                  {reservation.vueloId.costo
                    ? reservation.vueloId.costo.toFixed(2)
                    : "N/A"}{" "}
                  MXN
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {" "}
                  {/* Ajustado a emerald-600 */}
                  Costo Total Reserva: ${" "}
                  {(
                    (reservation.vueloId.costo || 0) * reservation.asientos
                  ).toFixed(2)}{" "}
                  MXN
                </p>
                {/* Puedes añadir más detalles del vuelo o de la reservación aquí */}
              </div>
              {/* Aquí podrías añadir un botón para cancelar la reservación, si ya implementaste esa funcionalidad */}
              {/* <button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                Cancelar Reserva
              </button> */}
            </div>
          ))}
        </div>
      </main>
      {/* Footer (copiado de tu ejemplo de Reservas) */}
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
