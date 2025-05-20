import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiChevronRight, FiSearch } from "react-icons/fi";
import { useVuelos } from "../context/VuelosContext";
// Importa todas las imágenes necesarias para los destinos
import cdmxImg from "/images/cdmx.jpg";
import cancunImg from "/images/cancun.jpg";
import monterreyImg from "/images/monterrey.jpg";
import pueblaImg from "/images/cdmx.jpg";
import guadalajaraImg from "/images/guadalajara.jpg";
import veracruzImg from "/images/queretaro.jpg";
import tijuanaImg from "/images/tijuana.jpg";
// Si tienes más imágenes de destinos en tus assets que no estaban en el 'Home' original
// pero sí en el 'HomePage' provisional (como Querétaro, Toluca, Chihuahua),
// asegúrate de importarlas aquí también.
// import queretaroImg from "../assets/vuelos/queretaro.jpg";
// import tolucaImg from "../assets/vuelos/toluca.jpg";
// import chihuahuaImg from "../assets/vuelos/chihuahua.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { vuelos, loading, error } = useVuelos();
  console.log("Vuelos data from context:", vuelos);

  const [searchDestination, setSearchDestination] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateInput;
  };

  useEffect(() => {
    // Cambia esta línea para verificar si vuelos es un array directamente
    if (!Array.isArray(vuelos)) {
      console.warn("Vuelos data is not an array:", vuelos);
      setSearchResults([]); // Asegura que searchResults sea un array vacío si los datos no son correctos
      return;
    }

    // Ahora filtra directamente el array `vuelos`
    const filtered = vuelos.filter((vuelo) => {
      const matchesDestination = searchDestination
        ? vuelo.destino.toLowerCase().includes(searchDestination.toLowerCase())
        : true;

      const matchesDate = searchDate
        ? vuelo.fecha === formatDateForComparison(searchDate)
        : true;

      return matchesDestination && matchesDate;
    });
    setSearchResults(filtered);
  }, [searchDestination, searchDate, vuelos]);

  // Datos combinados y enriquecidos para los destinos.
  // Cada objeto incluye `nombre` (para mostrar), `slug` (para la URL),
  // y todos los detalles de vuelo (precio, fecha, etc.) junto con la imagen importada.
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
        slug: "cancun",
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
      // Si necesitas los destinos adicionales de tu HomePage provisional, agrégalos aquí con sus imágenes importadas
      // { nombre: "Querétaro", slug: "queretaro", precio: "$950 MXN", img: queretaroImg, fecha: "28/06/2025", asientos: 20, avion: "Embraer 175" },
      // { nombre: "Toluca", slug: "toluca", precio: "$800 MXN", img: tolucaImg, fecha: "01/07/2025", asientos: 35, avion: "Cessna 208" },
      // { nombre: "Chihuahua", slug: "chihuahua", precio: "$1,450 MXN", img: chihuahuaImg, fecha: "05/07/2025", asientos: 22, avion: "Airbus A320" },
    ],
    []
  );

  // Muestra solo los primeros 4 destinos en la página principal, consistente con tu diseño original de 'Home'.
  const destinosPrincipales = allDestinosData.slice(0, 4);

  return (
    <div className="bg-white text-gray-900 font-sans pt-16">
      {/* Bienvenida */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-100 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Bienvenido a <span className="text-black">VUELAZOS XD</span>
        </motion.h1>
        <motion.p
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Descubre el placer de volar con nosotros. Vuelos increíbles, precios
          accesibles, y atención excepcional.
        </motion.p>
      </section>

      {/* --- Buscador de Vuelos --- */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-8">
            Encuentra tu próximo vuelo
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
            <div className="relative w-full md:w-1/3">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar destino (ej. Cancún)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
              />
            </div>
            <input
              type="date"
              className="w-full md:w-1/4 px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>

          {/* Resultados de la Búsqueda */}
          {loading ? (
            <p className="text-center text-gray-600 text-xl py-8">
              Cargando vuelos...
            </p>
          ) : error ? (
            <p className="text-center text-red-500 text-xl py-8">
              Error: {error}
            </p>
          ) : searchDestination || searchDate ? ( // Solo muestra resultados si hay una búsqueda
            <>
              <h3 className="text-3xl font-bold text-center mb-6">
                Resultados de la Búsqueda ({searchResults.length} vuelos)
              </h3>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {searchResults.map((vuelo) => (
                    <motion.div
                      key={vuelo._id} // Usa el _id del vuelo de la API como key
                      className="relative group cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden"
                      whileHover={{ scale: 1.03 }}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: true }}
                      onClick={() => navigate(`/reservar/${vuelo._id}`)} // Navega a la página de detalle
                    >
                      {/* Puedes usar una imagen genérica o intentar mapear con las imágenes de destinos populares si tienes */}
                      <img
                        src={
                          allDestinosData.find(
                            (d) =>
                              d.slug.toLowerCase() ===
                              vuelo.destino.toLowerCase()
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
                          Fecha: {vuelo.fechaSalida}
                        </p>
                        <p className="text-blue-600 font-bold text-xl">
                          Precio: ${vuelo.costo} MXN
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-lg font-semibold">
                          Ver detalles y reservar
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 text-xl py-8">
                  No se encontraron vuelos que coincidan con tu búsqueda.
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 text-xl py-8">
              Ingresa un destino o una fecha para buscar vuelos.
            </p>
          )}
        </div>
      </section>

      {/* Sección de Destinos Populares (anteriormente 'Vuelos') */}
      <section className="bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Destinos Populares</h2>
            <button
              onClick={() => navigate("/destinos")}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver más destinos <FiChevronRight className="ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinosPrincipales.map((destino, i) => (
              <motion.div
                key={destino.slug} // Usa el slug como key para mayor estabilidad
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Tarjeta principal del destino */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img
                    src={destino.img}
                    alt={`Vista de ${destino.nombre}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5 space-y-2">
                    <h3 className="text-2xl font-semibold">{destino.nombre}</h3>{" "}
                    {/* Usa el nombre para el título */}
                    <p className="text-gray-500">Desde: {destino.precio}</p>
                  </div>
                </div>

                {/* Ventana flotante con detalles del vuelo */}
                <div
                  // Este onClick ahora navega a la página específica de vuelos para este destino
                  onClick={() => navigate(`/vuelos/${destino.slug}`)}
                  className="absolute top-1/2 left-1/2 w-64 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-4 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto"
                  style={{ pointerEvents: "none" }} // Deshabilita el pointer-events por defecto para que el click del padre lo capture
                >
                  <h4 className="text-lg font-semibold mb-2">
                    Detalles del vuelo
                  </h4>
                  <p>
                    <span className="font-medium">Destino:</span>{" "}
                    {destino.nombre}
                  </p>
                  <p
                    className="text-center mt-3 text-sm text-blue-600 font-medium hover:underline"
                    style={{ pointerEvents: "auto" }}
                  >
                    {" "}
                    {/* Habilita el pointer-events de nuevo para el texto del enlace si quieres que el clic específico sea solo ahí */}
                    Ver vuelos y reservar
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ¿Por qué elegirnos? */}
      <section className="bg-white py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">¿Por qué elegirnos?</h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Brindamos una experiencia única con altos estándares de calidad,
          atención personalizada y compromiso con la seguridad.
        </p>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          {[
            {
              titulo: "✈️ Vuelos seguros",
              texto:
                "Nuestros aviones cumplen con los más altos estándares internacionales.",
            },
            {
              titulo: "💼 Equipaje incluido",
              texto:
                "Incluimos equipaje documentado y de mano sin costo adicional.",
            },
            {
              titulo: "🎫 Tarifas justas",
              texto: "Precios accesibles y sin cargos ocultos.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-gray-100 rounded-xl p-6 shadow hover:shadow-lg transition"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-2">{item.titulo}</h3>
              <p className="text-gray-600">{item.texto}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comentarios */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-10">Nuestros Clientes Opinan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
            {useMemo(() => {
              const comentarios = [
                {
                  name: "Juan Pérez",
                  review:
                    "Excelente servicio y puntualidad. ¡Repetiré sin duda!",
                },
                {
                  name: "Ana Gómez",
                  review: "Una experiencia de vuelo muy cómoda y agradable.",
                },
                {
                  name: "Carlos Díaz",
                  review: "Tarifas justas y atención excepcional.",
                },
                {
                  name: "Laura García",
                  review:
                    "Desde la compra hasta el aterrizaje, todo fue perfecto.",
                },
                {
                  name: "Marta López",
                  review: "Todo salió mejor de lo esperado. Muy recomendable.",
                },
                {
                  name: "Pedro Sánchez",
                  review: "El personal fue muy amable y servicial.",
                },
                {
                  name: "Sofía Herrera",
                  review: "Volveré a viajar con ustedes. Fue excelente.",
                },
                {
                  name: "Luis Torres",
                  review: "Muy buena relación calidad-precio.",
                },
              ];

              // Mezclar aleatoriamente
              for (let i = comentarios.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [comentarios[i], comentarios[j]] = [
                  comentarios[j],
                  comentarios[i],
                ];
              }

              // Devolver solo los primeros 4 comentarios
              return comentarios.slice(0, 4);
            }, []).map((c, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 rounded-xl shadow-md flex items-start space-x-4 hover:shadow-lg transition"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <img
                  src={`https://i.pravatar.cc/100?img=${
                    Math.floor(Math.random() * 70) + 1
                  }`}
                  alt={c.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="text-left">
                  <h4 className="font-semibold text-lg">{c.name}</h4>
                  <p className="text-gray-600 text-sm">{c.review}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
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
};

export default Home;
