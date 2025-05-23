import { useState } from "react";
import { useVuelos } from "../context/VuelosContext"; // Asegúrate de la ruta correcta

const AdminStatusPage = () => {
  const { vuelos, loading, error, updateVueloStatus } = useVuelos();
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroDestino, setFiltroDestino] = useState("");

  const handleStatusChange = async (id, nuevoEstado) => {
    try {
      await updateVueloStatus(id, nuevoEstado);
    } catch (err) {
      console.error("Error al cambiar el estado desde el componente:", err);
    }
  };

  const vuelosToFilter = Array.isArray(vuelos) ? vuelos : [];

  const vuelosFiltrados = vuelosToFilter.filter(
    (vuelo) =>
      (filtroStatus === "Todos" || vuelo.estado === filtroStatus) &&
      (filtroDestino === "" ||
        (vuelo.destino &&
          vuelo.destino.toLowerCase().includes(filtroDestino.toLowerCase())))
  );

  const estadosVuelo = [
    "Programado",
    "Retrasado",
    "Cancelado",
    "Abordando",
    "En vuelo",
    "Finalizado",
  ];

  const getStatusColorClass = (status) => {
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
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "Fecha no disponible";
    try {
      const date = new Date(isoString);
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return date.toLocaleDateString("es-ES", options);
    } catch (e) {
      console.error("Error al formatear fecha:", e);
      return "Fecha inválida";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Cambiar Status de Vuelos
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Filtro por status */}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
            <label
              htmlFor="filtroStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por Estado
            </label>
            <select
              id="filtroStatus"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900"
            >
              <option value="Todos">Todos los estados</option>
              {estadosVuelo.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
            <label
              htmlFor="filtroDestino"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Buscar por Destino
            </label>
            <input
              id="filtroDestino"
              type="text"
              placeholder="Ej. Cancún, CDMX"
              value={filtroDestino}
              onChange={(e) => setFiltroDestino(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900"
            />
          </div>
        </div>

        {/* Indicador de carga */}
        {loading ? (
          <p className="text-gray-700">Cargando vuelos...</p>
        ) : (
          /* Contenedor de tarjetas de vuelos */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vuelosFiltrados.length > 0 ? (
              vuelosFiltrados.map((vuelo) => (
                <div
                  key={vuelo._id}
                  className="bg-gray-100 p-6 rounded-xl shadow-md"
                >
                  {/* Origen y Destino en negrita y más grande */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {vuelo.origen} → {vuelo.destino}
                  </h2>
                  {/* Fecha de salida y llegada */}
                  <p className="text-gray-600 text-sm">
                    Salida: {formatDateTime(vuelo.fechaSalida)}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    Llegada: {formatDateTime(vuelo.fechaLlegada)}
                  </p>

                  <p className="mt-2 text-gray-900 font-bold flex items-center">
                    Status actual: {vuelo.estado}
                    <span
                      className={`ml-2 w-4 h-4 rounded-full ${getStatusColorClass(
                        vuelo.estado
                      )}`}
                      title={vuelo.estado}
                    ></span>
                  </p>

                  <select
                    className="mt-4 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900"
                    value={vuelo.estado}
                    onChange={(e) =>
                      handleStatusChange(vuelo._id, e.target.value)
                    }
                  >
                    {estadosVuelo.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-full">
                No hay vuelos con ese estado.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStatusPage;
