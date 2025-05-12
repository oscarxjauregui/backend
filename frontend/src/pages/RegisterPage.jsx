import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signup, isAuthenticated, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated]);

  const onSubmit = handleSubmit(async (values) => {
    signup(values);
  });

  return (
    <div className="bg-zinc-800 max-w-md p-10 rounded-3xl mx-auto mt-10">
      {registerErrors.map((error, i) => (
        <div className="bg-red-500 text-white p-2 rounded-md my-2" key={i}>
          {error}
        </div>
      ))}
      <h1 className="text-3xl text-center font-bold">Register</h1>

      <form onSubmit={onSubmit}>
        <input
          type="text"
          {...register("nombre", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          placeholder="Nombre"
        />
        {errors.nombre && (
          <p className="text-red-500">El nombre es obligatorio</p>
        )}
        <input
          type="text"
          {...register("apellido", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          placeholder="Apellido"
        />
        {errors.apellido && (
          <p className="text-red-500">El apellido es obligatorio</p>
        )}
        <input
          type="email"
          {...register("email", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          placeholder="Email"
        />
        {errors.email && (
          <p className="text-red-500">El email es obligatorio</p>
        )}
        <input
          type="number"
          {...register("telefono", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          placeholder="Telefono"
        />
        {errors.telefono && (
          <p className="text-red-500">El telefono es obligatorio</p>
        )}
        <input
          type="text"
          {...register("direccion", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          placeholder="Direccion"
        />
        {errors.direccion && (
          <p className="text-red-500">La direccion es obligatoria</p>
        )}
        <input
          type="password"
          {...register("password", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          placeholder="Password"
        />
        {errors.password && (
          <p className="text-red-500">La contraseña es obligatoria</p>
        )}
        <button
          type="submit"
          className="w-40 h-10 bg-blue-700 rounded-md mx-24"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
