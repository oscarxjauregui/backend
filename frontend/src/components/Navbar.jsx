import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  return (
    <nav className="bg-zinc-700 flex justify-between py-5 px-10">
      <Link to="/">
        <h1 className="text-2xl font-bold">VUELAZOS XD</h1>
      </Link>
      <ul className="flex gap-x-2">
        {isAuthenticated ? (
          <>
            <li>Bienvenido {user.nombre}</li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/" onClick={() => logout()}>
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
export default Navbar;
