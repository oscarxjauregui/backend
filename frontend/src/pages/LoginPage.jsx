import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signin, isAuthenticated, errors: signinErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]); 
  

  const onSubmit = handleSubmit((data) => {
    signin(data);
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow flex items-center justify-center px-6 sm:px-8 lg:px-12 py-20">
        <div className="bg-white p-10 sm:p-12 rounded-lg shadow-xl w-full max-w-lg">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
            Bienvenido de nuevo
          </h2>
          <p className="text-center text-gray-500 mb-8 text-lg">
            Inicia sesión para continuar tu viaje con nosotros.
          </p>

          {signinErrors.length > 0 && (
            <div className="mb-4">
              {signinErrors.map((error, i) => (
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
            <div className="mb-6">
              <input
                type="email"
                {...register("email", { required: "El email es obligatorio" })}
                placeholder="Correo electrónico"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-gray-700"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <input
                type="password"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
                placeholder="Contraseña"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-gray-700"
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
              Entrar
            </button>
          </form>

          <div className="mt-8 text-center text-sm sm:text-base text-gray-600">
    
            <span>
              ¿No tienes cuenta?
              <Link to="/register" className="text-blue-600 hover:underline">
                Regístrate
              </Link>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12" />

      <footer className="bg-gray-900 text-white text-center py-6 px-4">
        <p className="text-sm sm:text-base font-medium">
          ¿Tienes dudas? Contáctanos:
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

export default LoginPage;
