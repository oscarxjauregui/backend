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
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated]);



  const onSubmit = handleSubmit((data) => {
    signin(data);
  });

  return (
    <div className="bg-zinc-800 max-w-md p-10 rounded-3xl mx-auto mt-10">
      {signinErrors.map((error, i) => (
        <div className="bg-red-500 text-white p-2 rounded-md my-2" key={i}>
          {error}
        </div>
      ))}
      <h1 className="text-3xl text-center font-bold">Iniciar sesión</h1>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          {...register("email", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2 mt-5"
          placeholder="Email"
        />
        {errors.email && (
          <p className="text-red-500">El email es obligatorio</p>
        )}
        <input
          type="password"
          {...register("password", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          placeholder="Contraseña"
        />
        {errors.password && (
          <p className="text-red-500">La contraseña es obligatoria</p>
        )}
        <button
          type="submit"
          className="w-40 h-10 bg-blue-700 rounded-md mx-24 mt-2"
        >
          Iniciar sesión
        </button>
      </form>
      <p className="flex gap-x-2 justify-between mt-5">
        No tienes cuenta?{" "}
        <Link to="/register" className="text-sky-500">
          Registrate
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
