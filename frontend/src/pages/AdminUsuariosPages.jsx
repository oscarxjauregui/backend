import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useUsers } from "../context/UsersContext"; // Asegúrate de que la ruta sea correcta

const AdminUsuariosPage = () => {
  const {
    users, // Ahora obtenemos todos los usuarios del contexto
    loadingUsers,
    errorUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "", // La contraseña es necesaria para la creación, opcional para la actualización
    telefono: "",
    direccion: "",
    rol: "",
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(null);

  // Estados para filtros
  const [filterRole, setFilterRole] = useState("");
  const [filterName, setFilterName] = useState(""); // Filtrar por nombre/apellido

  // Efecto para filtrar usuarios cada vez que cambian los filtros o la lista de usuarios
  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole ? user.rol === filterRole : true;
    const matchesName = filterName
      ? user.nombre.toLowerCase().includes(filterName.toLowerCase()) ||
        user.apellido.toLowerCase().includes(filterName.toLowerCase()) ||
        user.email.toLowerCase().includes(filterName.toLowerCase()) // También permite filtrar por email
      : true;
    return matchesRole && matchesName;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      telefono: "",
      direccion: "",
      rol: "",
    });
    setEditingUserId(null);
    setShowModal(false);
    setMessage(null); // Limpiar mensajes al resetear el formulario
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null); // Limpiar mensajes anteriores

    let res;
    if (editingUserId) {
      const confirmUpdate = window.confirm(
        "¿Estás seguro de que deseas actualizar este usuario?"
      );
      if (confirmUpdate) {
        const dataToUpdate = {};
        // Solo enviar campos que tienen un valor o que deben actualizarse (como la contraseña si se proporciona)
        for (const key in formData) {
          // Si es el campo de contraseña y está vacío, no lo envíes para actualizar
          if (key === "password" && formData[key] === "") {
            continue;
          }
          if (formData[key] !== "" && formData[key] !== null) {
            dataToUpdate[key] = formData[key];
          }
        }
        res = await updateUser(editingUserId, dataToUpdate);
      }
    } else {
      res = await createUser(formData);
    }

    if (res && res.success) {
      setMessage({ type: "success", text: res.message });
      resetForm();
    } else if (res && res.message) {
      setMessage({ type: "error", text: res.message });
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este usuario?"
    );
    if (confirmDelete) {
      setMessage(null);
      const res = await deleteUser(id);

      if (res && res.success) {
        setMessage({ type: "success", text: res.message });
        if (editingUserId === id) {
          resetForm(); // Cerrar el modal si el usuario eliminado estaba siendo editado
        }
      } else if (res && res.message) {
        setMessage({ type: "error", text: res.message });
      }
    }
  };

  const handleEdit = (userToEdit) => {
    setEditingUserId(userToEdit._id || userToEdit.id);
    setFormData({
      nombre: userToEdit.nombre || "",
      apellido: userToEdit.apellido || "",
      email: userToEdit.email || "",
      password: "", // NUNCA precargar la contraseña por seguridad
      telefono: userToEdit.telefono || "",
      direccion: userToEdit.direccion || "",
      rol: userToEdit.rol || "",
    });
    setShowModal(true);
  };

  useEffect(() => {
    if (errorUsers) {
      setMessage({ type: "error", text: errorUsers });
    }
  }, [errorUsers]);

  if (loadingUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-700">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar de administrador */}
      <header className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/homea" className="text-2xl font-bold hover:text-gray-400">
            Panel Administrador
          </Link>
          <p className="text-gray-400 text-sm">Gestión de Usuarios</p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          Gestión de Usuarios
        </h1>

        {/* Notification Messages */}
        {message && (
          <div
            className={`p-4 mb-4 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        {/* Button to open creation modal */}
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-md mb-8"
        >
          Crear Nuevo Usuario
        </button>

        {/* Create/Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingUserId !== null
                    ? "Editar Usuario"
                    : "Crear Nuevo Usuario"}
                </h2>
                <button
                  onClick={() => resetForm()}
                  className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Nombre */}
                <div className="relative">
                  <label
                    htmlFor="nombre"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required={!editingUserId} // Requerido para nuevo, opcional para editar
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Apellido */}
                <div className="relative">
                  <label
                    htmlFor="apellido"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required={!editingUserId}
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Email */}
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required={!editingUserId}
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Contraseña (siempre requerida para nuevo, opcional para actualizar) */}
                <div className="relative">
                  <label
                    htmlFor="password"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder={
                      editingUserId
                        ? "Dejar vacío para mantener la actual"
                        : "Contraseña"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUserId} // Solo es requerido si se está creando un nuevo usuario
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Teléfono */}
                <div className="relative">
                  <label
                    htmlFor="telefono"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Teléfono
                  </label>
                  <input
                    type="text"
                    id="telefono"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required={!editingUserId}
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Dirección */}
                <div className="relative">
                  <label
                    htmlFor="direccion"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={handleChange}
                    required={!editingUserId}
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Rol */}
                <div className="relative">
                  <label
                    htmlFor="rol"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Rol
                  </label>
                  <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    required={!editingUserId}
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  >
                    <option value="">Seleccionar Rol</option>
                    <option value="Cliente">Cliente</option>
                    <option value="Admin">Admin</option>
                    <option value="Piloto">Piloto</option>
                    <option value="Azafata">Azafata</option>
                  </select>
                </div>

                {/* Botón de Envío */}
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white py-4 rounded-md mt-6 w-full col-span-full"
                >
                  {editingUserId !== null
                    ? "Actualizar Usuario"
                    : "Agregar Usuario"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Sección de Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Filtros de Usuarios
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Filtrar por Rol */}
            <div className="relative">
              <label
                htmlFor="filterRole"
                className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
              >
                Filtrar por Rol
              </label>
              <select
                id="filterRole"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
              >
                <option value="">Todos los Roles</option>
                <option value="Cliente">Cliente</option>
                <option value="Admin">Admin</option>
                <option value="Piloto">Piloto</option>
                <option value="Azafata">Azafata</option>
              </select>
            </div>
            {/* Filtrar por Nombre/Email */}
            <div className="relative">
              <label
                htmlFor="filterName"
                className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
              >
                Filtrar por Nombre/Email
              </label>
              <input
                type="text"
                id="filterName"
                placeholder="Nombre, Apellido o Email"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
              />
            </div>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredUsers.length === 0 && !loadingUsers ? (
            <p className="text-gray-600 text-center col-span-full">
              No hay usuarios que coincidan con los filtros.
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id || user.id} // Usar _id de MongoDB
                className="bg-gray-200 border border-gray-300 rounded-lg p-4 shadow-md"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.nombre} {user.apellido}
                </h3>
                <p className="text-gray-600">Email: {user.email}</p>
                <p className="text-gray-600">Teléfono: {user.telefono}</p>
                <p className="text-gray-600">Dirección: {user.direccion}</p>
                <p className="text-gray-600">Rol: {user.rol}</p>
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user._id || user.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminUsuariosPage;
