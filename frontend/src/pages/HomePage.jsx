import { useVuelos } from "../context/VuelosContext";
import { Link } from "react-router-dom";

function HomePage() {
  const { vuelos, loading, error } = useVuelos();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("es-ES", options);
    } catch (err) {
      return "Fecha inválida" + err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-400">Cargando vuelos...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }
  if (!loading && vuelos.lenght === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-400">
          No hay vuelos disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Vuelos Disponibles
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vuelos.map((vuelo) => (
          <div
            key={vuelo._id}
            className="bg-zinc-800 p-6 rounded-lg shadow-lg text-white flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {vuelo.origen} <span className="text-gray-400">hacia</span>{" "}
                {vuelo.destino}
              </h2>
              <p className="text-sm text-gray-300 mb-1">
                Aerolínea:{" "}
                <span className="font-medium">{vuelo.aerolinea}</span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Avión: <span className="font-medium">{vuelo.avion}</span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Salida:{" "}
                <span className="font-medium">
                  {formatDate(vuelo.fechaSalida)}
                </span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Llegada:{" "}
                <span className="font-medium">
                  {formatDate(vuelo.fechaLlegada)}
                </span>
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Estado: <span className="font-medium">{vuelo.estado}</span>
              </p>
              <p className="text-lg font-bold text-emerald-400 mt-2 mb-1">
                Costo: ${vuelo.costo.toFixed(2)}
              </p>
              <p
                className={`text-sm font-medium ${
                  vuelo.asientosDisponibles > 10
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                Asientos Disponibles: {vuelo.asientosDisponibles}
              </p>
            </div>
            {/* Asume que tienes una ruta /reservar/:id para la página de reserva */}
            <Link
              to={`/reservar/${vuelo._id}`} // Cambia esta ruta según tu configuración
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition duration-200 ease-in-out block"
            >
              Reservar
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
