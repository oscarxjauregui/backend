// src/pages/VueloStatusPage.jsx

import { useState, useEffect, useCallback } from "react";
import { useVuelos } from "../context/VuelosContext"; // Asegúrate de que la ruta sea correcta

function VueloStatusPage() {
  const { vuelos, loading, error, fetchVuelos } = useVuelos();

  const [filtroEstado, setFiltroEstado] = useState("Todos");
  // --- CAMBIO AQUÍ: de filtroOrigen a filtroDestino ---
  const [filtroDestino, setFiltroDestino] = useState("");
  // ----------------------------------------------------
  const [filtroFechaLlegada, setFiltroFechaLlegada] = useState("");

  useEffect(() => {
    fetchVuelos();
  }, [fetchVuelos]);

  const estadosVuelo = [
    "Programado",
    "Retrasado",
    "Cancelado",
    "Abordando",
    "En vuelo",
    "Finalizado",
  ];

  const getStatusColorClass = useCallback((status) => {
    switch (status) {
      case "Programado":
        return "bg-blue-500";
      case "Retrasado":
        return "bg-yellow-500";
      case "Cancelado":
        return "bg-red-500";
      case "Abordando":
        return "bg-orange-500";
      case "Finalizado":
        return "bg-green-500";
      case "En vuelo":
        return "bg-purple-500";
      default:
        return "bg-gray-400";
    }
  }, []);

  const formatDateTime = useCallback((isoString) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      return date.toLocaleDateString("es-ES", options);
    } catch (e) {
      console.error("Error al formatear fecha:", e);
      return "Fecha inválida";
    }
  }, []);

  const formatDateForComparison = useCallback((isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Error al formatear fecha para comparación:", e);
      return "";
    }
  }, []);

  const vuelosToFilter = Array.isArray(vuelos) ? vuelos : [];

  const vuelosFiltrados = vuelosToFilter.filter((vuelo) => {
    const matchEstado = filtroEstado === "Todos" || vuelo.estado === filtroEstado;

    // --- CAMBIO AQUÍ: de matchOrigen a matchDestino ---
    const matchDestino =
      filtroDestino === "" ||
      (vuelo.destino && // Asegúrate de que vuelo.destino exista
        vuelo.destino.toLowerCase().includes(filtroDestino.toLowerCase()));
    // ----------------------------------------------------

    const matchFechaLlegada =
        filtroFechaLlegada === "" ||
        (vuelo.fechaLlegada &&
        formatDateForComparison(vuelo.fechaLlegada) === filtroFechaLlegada);

    return matchEstado && matchDestino && matchFechaLlegada; // <-- Asegúrate de usar matchDestino
  });

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Estado de Vuelos
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="filtroEstado"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por Estado
            </label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="Todos">Todos los estados</option>
              {estadosVuelo.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          {/* --- CAMBIO AQUÍ: Etiqueta y placeholder para Destino --- */}
          <div>
            <label
              htmlFor="filtroDestino"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Buscar por Destino
            </label>
            <input
              id="filtroDestino"
              type="text"
              placeholder="Ej. Cancún" // Placeholder sugerente
              value={filtroDestino}
              onChange={(e) => setFiltroDestino(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          {/* ---------------------------------------------------- */}

          <div>
            <label
              htmlFor="filtroFechaLlegada"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por Fecha de Llegada
            </label>
            <input
              id="filtroFechaLlegada"
              type="date"
              value={filtroFechaLlegada}
              onChange={(e) => setFiltroFechaLlegada(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-gray-700 text-center text-lg">Cargando vuelos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vuelosFiltrados.length > 0 ? (
              vuelosFiltrados.map((vuelo) => (
                <div
                  key={vuelo._id}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {vuelo.origen} → {vuelo.destino}
                  </h2>
                  <p className="text-gray-700 text-sm mb-1">
                    Aerolínea: <span className="font-medium">{vuelo.aerolinea}</span>
                  </p>
                  <p className="text-gray-700 text-sm mb-1">
                    Avión: <span className="font-medium">{vuelo.avion}</span>
                  </p>
                  <p className="text-gray-700 text-sm mb-1">
                    Salida: <span className="font-medium">{formatDateTime(vuelo.fechaSalida)}</span>
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    Llegada: <span className="font-medium">{formatDateTime(vuelo.fechaLlegada)}</span>
                  </p>

                  <div className="flex items-center mt-3">
                    <p className="text-gray-900 font-semibold mr-2">Estado:</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColorClass(
                        vuelo.estado
                      )}`}
                    >
                      {vuelo.estado}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-full text-center text-lg">
                No se encontraron vuelos que coincidan con los filtros.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VueloStatusPage;