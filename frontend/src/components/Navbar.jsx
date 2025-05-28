import { useState } from "react";
import { Menu, X, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const isAdmin = isAuthenticated && user && user.rol === "admin";

  return (
    <header className="bg-gray-900 shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        {/* Contenedor para el Logo y el mensaje de bienvenida */}
        <div className="flex items-center gap-x-4">
          {/* Logo como enlace a home */}
          <Link
            to="/"
            className="text-2xl font-bold text-white hover:opacity-90"
            onClick={handleLinkClick}
          >
            VUELAZOS XD
          </Link>

          {/* Mensaje de bienvenida (solo si está autenticado) */}
          {isAuthenticated && (
            <span className="text-white text-sm font-medium">
              | Bienvenido {user.nombre}
            </span>
          )}
        </div>

        {/* Menú escritorio */}
        <nav className="hidden md:flex items-center space-x-6 text-gray-300 font-medium">
          <Link to="/EstadoVuelos" className="hover:text-white transition">
            Estado de vuelos
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hover:text-white transition">
                Perfil
              </Link>

              {isAdmin ? (
                <Link to="/admin/panel" className="hover:text-white transition">
                  {" "}
                  {/* Necesitarás crear esta ruta */}
                  Panel
                </Link>
              ) : (
                <Link
                  to="/myreservations"
                  className="hover:text-white transition"
                >
                  Mis Reservaciones
                </Link>
              )}

              <Link
                to="/"
                onClick={() => {
                  logout();
                  handleLinkClick();
                }}
                className="ml-2 bg-white text-gray-900 px-4 py-1 rounded-full hover:bg-gray-200 transition text-sm font-semibold"
              >
                Cerrar sesión
              </Link>
            </>
          ) : (
            <>
              {/* Enlaces no autenticados */}
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="ml-2 bg-white text-gray-900 px-4 py-1 rounded-full hover:bg-gray-200 transition text-sm font-semibold"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                onClick={handleLinkClick}
                className="hover:text-white transition text-sm"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>

        {/* Botón móvil */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-300"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menú móvil (condicional) */}
      {open && (
        <nav className="md:hidden bg-gray-800 border-t border-gray-700 shadow-sm">
          <ul className="flex flex-col px-6 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                {/* Mensaje de bienvenida en móvil (opcional, puedes quitarlo si solo lo quieres en desktop) */}
                <li className="flex items-center space-x-3 text-white text-sm">
                  <Plane size={20} className="text-gray-300" />
                  <span>Bienvenido, {user.nombre}</span>
                </li>
                {/* Enlaces autenticados en móvil */}
                <li>
                  <Link
                    to="/profile"
                    className="text-sm text-white"
                    onClick={handleLinkClick}
                  >
                    Perfil
                  </Link>
                </li>
                <li>
                  {isAdmin ? (
                    <Link
                      to="/admin/panel" // Necesitarás crear esta ruta
                      className="text-sm text-white"
                      onClick={handleLinkClick}
                    >
                      Panel
                    </Link>
                  ) : (
                    <Link
                      to="/myreservations"
                      className="text-sm text-white"
                      onClick={handleLinkClick}
                    >
                      Mis Reservaciones
                    </Link>
                  )}
                </li>
                <li>
                  <Link
                    to="/"
                    className="text-sm text-white"
                    onClick={() => {
                      logout();
                      handleLinkClick();
                    }}
                  >
                    Cerrar sesión
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* Enlaces no autenticados en móvil */}
                <li className="flex items-center space-x-3">
                  <Plane size={20} className="text-gray-300" />
                  <Link
                    to="/login"
                    className="text-sm text-white"
                    onClick={handleLinkClick}
                  >
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-sm text-white"
                    onClick={handleLinkClick}
                  >
                    Registrarse
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
