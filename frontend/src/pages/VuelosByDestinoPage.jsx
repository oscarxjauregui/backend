import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Importa useNavigate
import { useVuelosByDestino } from "../context/VuelosByDestinoContext";
import { motion } from "framer-motion"; // Importa motion para las animaciones
import { FiSearch } from "react-icons/fi"; // Para el icono de búsqueda

// Importa todas las imágenes necesarias para los destinos (copiadas de HomePage)
import cdmxImg from "/images/cdmx.jpg";
import cancunImg from "/images/cancun.jpg";
import monterreyImg from "/images/monterrey.jpg";
import pueblaImg from "/images/cdmx.jpg"; // ¡Recuerda corregir esta si tienes un puebla.jpg real!
import guadalajaraImg from "/images/guadalajara.jpg";
import veracruzImg from "/images/queretaro.jpg"; // ¡Recuerda corregir esta si tienes un veracruz.jpg real!
import tijuanaImg from "/images/tijuana.jpg";

function VuelosByDestinoPage() {
  const { destino } = useParams();
  const navigate = useNavigate(); // Inicializa useNavigate

  const {
    vuelos: fetchedVuelos, // Renombramos 'vuelos' del contexto a 'fetchedVuelos' para evitar conflicto
    loading,
    error,
    noResults,
    fetchVuelosByDestino,
    clearVuelos,
  } = useVuelosByDestino();

  // Estado para el filtro de fecha
  const [searchDate, setSearchDate] = useState("");
  // Estado para los vuelos filtrados
  const [filteredVuelos, setFilteredVuelos] = useState([]);

  // Datos de destinos con imágenes (copiados de HomePage)
  const allDestinosData = useMemo(
    () => [
      {
        nombre: "Ciudad de México",
        slug: "CDMX",
        precio: "$1,299 MXN",
        img: cdmxImg,
        fecha: "15/06/2025",
        asientos: 25,
        avion: "Airbus A320",
      },
      {
        nombre: "Cancún",
        slug: "cancún",
        precio: "$1,899 MXN",
        img: cancunImg,
        fecha: "20/06/2025",
        asientos: 18,
        avion: "Boeing 737",
      },
      {
        nombre: "Monterrey",
        slug: "monterrey",
        precio: "$1,499 MXN",
        img: monterreyImg,
        fecha: "22/06/2025",
        asientos: 30,
        avion: "Embraer 190",
      },
      {
        nombre: "Guadalajara",
        slug: "guadalajara",
        precio: "$1,399 MXN",
        img: guadalajaraImg,
        fecha: "21/06/2025",
        asientos: 16,
        avion: "Boeing 737 MAX",
      },
      {
        nombre: "Puebla",
        slug: "puebla",
        precio: "$999 MXN",
        img: pueblaImg,
        fecha: "18/06/2025",
        asientos: 28,
        avion: "CRJ 700",
      },
      {
        nombre: "Veracruz",
        slug: "veracruz",
        precio: "$1,099 MXN",
        img: veracruzImg,
        fecha: "19/06/2025",
        asientos: 27,
        avion: "Airbus A320neo",
      },
      {
        nombre: "Tijuana",
        slug: "tijuana",
        precio: "$1,599 MXN",
        img: tijuanaImg,
        fecha: "23/06/2025",
        asientos: 20,
        avion: "Boeing 757",
      },
    ],
    []
  );

  // Funciones para formatear fechas (copiadas de HomePage)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
        2,
        "0"
      )}`;
    }
    return dateString;
  };

  const formatDateForComparison = (dateInput) => {
    if (!dateInput) return "";
    const parts = dateInput.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // Formato DD/MM/YYYY
    }
    return dateInput;
  };

  // Efecto para obtener vuelos del contexto cuando cambia el destino
  useEffect(() => {
    console.log(`[VuelosByDestinoPage] Destino en URL: ${destino}`);
    if (destino) {
      fetchVuelosByDestino(destino);
    } else {
      clearVuelos();
    }
    return () => {
      console.log(
        "[VuelosByDestinoPage] Limpiando vuelos al desmontar o cambiar destino."
      );
      clearVuelos();
    };
  }, [destino, fetchVuelosByDestino, clearVuelos]);

  // Efecto para filtrar los vuelos cada vez que cambian los vuelos obtenidos o la fecha de búsqueda
  useEffect(() => {
    if (Array.isArray(fetchedVuelos)) {
      const currentFiltered = fetchedVuelos.filter((vuelo) => {
        const matchesDate = searchDate
          ? vuelo.fechaSalida.startsWith(formatDateForComparison(searchDate)) // Asume fechaSalida es "DD/MM/YYYY HH:mm"
          : true;
        return matchesDate;
      });
      setFilteredVuelos(currentFiltered);
    } else {
      setFilteredVuelos([]);
    }
  }, [fetchedVuelos, searchDate]);

  // Función para formatear la fecha de los vuelos para mostrar (copiada de HomePage)
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      // Intenta parsear como ISO string o como "DD/MM/YYYY HH:mm"
      const date = new Date(dateString);
      // Si la fecha es inválida (por ejemplo, "DD/MM/YYYY HH:mm" no es un formato estándar de new Date),
      // intenta un parseo manual si el formato es conocido.
      if (isNaN(date.getTime()) && dateString.includes("/")) {
        const [datePart, timePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("/");
        // Intenta crear una fecha en formato YYYY-MM-DD para un parseo más robusto
        const isoLikeDate = `${year}-${month}-${day}${
          timePart ? "T" + timePart : ""
        }`;
        const parsedDate = new Date(isoLikeDate);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      } else if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return "Fecha inválida";
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Fecha inválida";
    }
  }, []);

  // Manejo de estados iniciales con el estilo de HomePage
  if (!destino) {
    return (
      <div className="bg-white text-gray-900 font-sans pt-16 h-screen flex justify-center items-center">
        <p className="text-2xl font-semibold text-gray-700">
          Especifique un destino para buscar vuelos.
        </p>
      </div>
    );
  }

  // Renderizado del componente principal
  return (
    <div className="bg-white text-gray-900 font-sans pt-16">
      {/* Sección de Bienvenida/Encabezado */}
      <section className="py-10 bg-gradient-to-br from-white to-gray-100 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Vuelos a <span className="text-black">{destino}</span>
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Encuentra los mejores vuelos para tu viaje a {destino} con VUELAZOS
          XD.
        </motion.p>
      </section>

      {/* Sección del Buscador de Vuelos (solo por fecha) */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-8">
            Filtrar vuelos por fecha
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
            {/* Solo el input de fecha */}
            <input
              type="date"
              className="w-full md:w-1/4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>

          {/* Resultados de la Búsqueda / Mensajes de estado */}
          {loading ? (
            <p className="text-center text-gray-600 text-xl py-8">
              Cargando vuelos para {destino}...
            </p>
          ) : error ? (
            <p className="text-center text-red-500 text-xl py-8">
              Error al cargar vuelos: {error}
            </p>
          ) : noResults && !searchDate ? ( // noResults solo si no hay filtro de fecha
            <p className="text-center text-gray-600 text-xl py-8">
              No se encontraron vuelos para el destino:{" "}
              <span className="font-bold">{destino}</span>.
            </p>
          ) : filteredVuelos.length === 0 ? ( // Mensaje cuando no hay vuelos filtrados
            <p className="text-center text-gray-600 text-xl py-8">
              No hay vuelos disponibles para {destino} en la fecha seleccionada.
            </p>
          ) : (
            <>
              <h3 className="text-3xl font-bold text-center mb-6">
                Vuelos encontrados ({filteredVuelos.length} vuelos)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredVuelos.map((vuelo, i) => (
                  <motion.div
                    key={vuelo._id}
                    className="relative group cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden"
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }} // Animación con delay
                    viewport={{ once: true }}
                    onClick={() => navigate(`/reservar/${vuelo._id}`)} // Navega a la página de detalle
                  >
                    <img
                      src={
                        allDestinosData.find(
                          (d) =>
                            d.slug.toLowerCase() === vuelo.destino.toLowerCase()
                        )?.img ||
                        "https://via.placeholder.com/400x250?text=Vuelo+a+" +
                          vuelo.destino
                      }
                      alt={`Vista de ${vuelo.destino}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-5 space-y-2">
                      <h3 className="text-2xl font-semibold">
                        {vuelo.destino}
                      </h3>
                      <p className="text-gray-700">Origen: {vuelo.origen}</p>
                      <p className="text-gray-500">
                        Fecha de Salida: {formatDate(vuelo.fechaSalida)}
                      </p>
                      <p className="text-blue-600 font-bold text-xl">
                        Precio: ${vuelo.costo} MXN
                      </p>
                    </div>
                    {/* Overlay al pasar el mouse */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-lg font-semibold">
                        Ver detalles y reservar
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer (copiado de HomePage) */}
      <footer className="bg-gray-900 text-white text-center py-8 px-4">
        <p className="text-lg font-medium">
          ¿Tienes dudas? Contáctanos: contacto@aerolinea.com
        </p>
        <p className="text-sm mt-2">
          &copy; {new Date().getFullYear()} Aerolínea. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
}

export default VuelosByDestinoPage;
