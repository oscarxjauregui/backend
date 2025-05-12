import { Link } from "react-router-dom";

const destinos = [
  { nombre: "Ciudad de México", slug: "CDMX", imageUrl: "images/cdmx.jpg" },
  { nombre: "Monterrey", slug: "Monterrey", imageUrl: "images/monterrey.jpg" },
  { nombre: "Querétaro", slug: "Queretaro", imageUrl: "images/queretaro.jpg" },
  { nombre: "Tijuana", slug: "Tijuana", imageUrl: "images/tijuana.jpg" },
  { nombre: "Cancún", slug: "Cancun", imageUrl: "images/cancun.jpg" },
  { nombre: "Toluca", slug: "Toluca", imageUrl: "images/toluca.jpg" },
  {
    nombre: "Guadalajara",
    slug: "Guadalajara",
    imageUrl: "images/guadalajara.jpg",
  },
  { nombre: "Chihuahua", slug: "Chihuahua", imageUrl: "images/chihuahua.jpg" },
];

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {destinos.map((destino) => (
          <Link
            key={destino.slug}
            to={`/vuelos/${destino.slug}`}
            className="bg-zinc-800 rounded-lg shadow-lg text-white 
                       hover:bg-zinc-700 transition duration-200 overflow-hidden
                       flex flex-col"
          >
            <div className="w-full h-48 md:h-56 lg:h-64 overflow-hidden">
              <img
                src={`/${destino.imageUrl}`}
                alt={`Vista de ${destino.nombre}`}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300 ease-in-out"
              />
            </div>
            <div className="p-6 text-center flex-grow flex flex-col justify-center">
              <h2 className="text-2xl font-semibold mb-2">{destino.nombre}</h2>
              <p className="text-gray-400 text-sm">
                Ver vuelos a {destino.nombre}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
