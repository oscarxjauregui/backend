import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // Asegúrate de que esta ruta sea correcta

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signup, isAuthenticated, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  // Redirigir al usuario a la página principal si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    signup(values);
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <Navbar />

      {/* Contenido principal con el formulario de registro */}
      <div className="flex-grow flex items-center justify-center px-6 sm:px-8 lg:px-12 py-12">
        <div className="bg-white p-10 sm:p-12 rounded-lg shadow-xl w-full max-w-lg border border-gray-300">
          <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
            Regístrate
          </h2>

          {/* Mostrar errores del servidor/registro */}
          {registerErrors.length > 0 && (
            <div className="mb-4">
              {registerErrors.map((error, i) => (
                <div
                  className="bg-red-500 text-white p-3 rounded-md mb-2 text-center"
                  key={i}
                >
                  {error}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit}>
            {/* Nombre */}
            <div className="mb-4">
              <input
                type="text"
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                })}
                placeholder="Nombre"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 text-gray-700"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div className="mb-4">
              <input
                type="text"
                {...register("apellido", {
                  required: "El apellido es obligatorio",
                })}
                placeholder="Apellido"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 text-gray-700"
              />
              {errors.apellido && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.apellido.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <input
                type="email"
                {...register("email", { required: "El email es obligatorio" })}
                placeholder="Correo electrónico"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 text-gray-700"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div className="mb-4">
              <input
                type="tel" // Usamos type="tel" para teléfonos
                {...register("telefono", {
                  required: "El teléfono es obligatorio",
                })}
                placeholder="Teléfono"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 text-gray-700"
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div className="mb-4">
              <input
                type="text"
                {...register("direccion", {
                  required: "La dirección es obligatoria",
                })}
                placeholder="Dirección"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 text-gray-700"
              />
              {errors.direccion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.direccion.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="mb-6">
              <input
                type="password"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
                placeholder="Contraseña"
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-300 text-gray-700"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-4 rounded-lg w-full hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            >
              Crear cuenta
            </button>
          </form>

          {/* Enlace para volver al login */}
          <div className="mt-8 text-center text-sm sm:text-base text-gray-600">
            <Link to="/login" className="text-blue-600 hover:underline">
              Ya tengo una cuenta, iniciar sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6 px-4">
        <p className="text-sm sm:text-base font-medium">
          ¿Tienes dudas? Contáctanos:{" "}
          <a
            href="mailto:contacto@aerolinea.com"
            className="text-blue-400 hover:underline"
          >
            contacto@aerolinea.com
          </a>
        </p>
        <p className="text-xs sm:text-sm mt-3">
          &copy; {new Date().getFullYear()} Aerolínea. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
}

export default RegisterPage;
