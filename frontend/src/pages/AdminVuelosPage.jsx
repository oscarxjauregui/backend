import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAdminVuelos } from "../context/AdminVuelosContex"; // Asegúrate de que la ruta sea correcta
import { useUsers } from "../context/UsersContext"; // Asegúrate de que la ruta sea correcta

const AdminVuelosPage = () => {
  const {
    vuelos,
    loading,
    error,
    createAdminVuelo,
    updateAdminVuelo,
    deleteAdminVuelo,
  } = useAdminVuelos();

  const { pilotos, azafatas, loadingUsers, errorUsers } = useUsers();

  const [formData, setFormData] = useState({
    origen: "",
    destino: "",
    fechaSalida: "", // Corregido: si tu campo en el backend es 'fechaSalida'
    avion: "",
    costo: "",
    piloto: "",
    copiloto: "",
    azafata1: "",
    azafata2: "",
    azafata3: "",
    //    imagen: null,
  });

  const [editingVueloId, setEditingVueloId] = useState(null);
  const [showModal, setShowModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal
  const [message, setMessage] = useState(null);

  // Estados para los filtros
  const [filterDestino, setFilterDestino] = useState("");
  const [filterFecha, setFilterFecha] = useState("");
  const [filteredVuelos, setFilteredVuelos] = useState([]);

  // Efecto para filtrar vuelos cada vez que cambian los filtros o la lista de vuelos
  useEffect(() => {
    let currentFilteredVuelos = vuelos;

    // Filtro por destino
    if (filterDestino) {
      currentFilteredVuelos = currentFilteredVuelos.filter((vuelo) =>
        vuelo.destino.toLowerCase().includes(filterDestino.toLowerCase())
      );
    }

    // Filtro por fecha
    if (filterFecha) {
      currentFilteredVuelos = currentFilteredVuelos.filter((vuelo) => {
        // Asegúrate de que los formatos de fecha coincidan o se conviertan
        // Aquí asumimos que vuelo.fechaSalida es una cadena 'YYYY-MM-DD'
        return vuelo.fechaSalida === filterFecha;
      });
    }

    setFilteredVuelos(currentFilteredVuelos);
  }, [vuelos, filterDestino, filterFecha]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //   const handleImageChange = (e) => {
  //     const file = e.target.files[0];
  //     if (file) {
  //       // Si necesitas enviar el archivo directamente al backend:
  //       setFormData({ ...formData, imagen: file });
  //       // Si solo necesitas la URL para mostrarla en el frontend antes de subir:
  //       // setFormData({ ...formData, imagen: URL.createObjectURL(file) });
  //     }
  //   };

  const resetForm = () => {
    setFormData({
      origen: "",
      destino: "",
      fechaSalida: "",
      avion: "",
      costo: "",
      piloto: "",
      copiloto: "",
      azafata1: "",
      azafata2: "",
      azafata3: "",
      //   imagen: null,
    });
    setEditingVueloId(null);
    setShowModal(false); // Ocultar el modal al resetear el formulario
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    let res;
    if (editingVueloId) {
      const confirmUpdate = window.confirm(
        "¿Estás seguro de que deseas actualizar este vuelo?"
      );
      if (confirmUpdate) {
        const dataToUpdate = {};
        for (const key in formData) {
          if (formData[key] !== "" && formData[key] !== null) {
            dataToUpdate[key] = formData[key];
          }
        }
        res = await updateAdminVuelo(editingVueloId, dataToUpdate);
      }
    } else {
      res = await createAdminVuelo(formData);
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
      "¿Estás seguro de que deseas eliminar este vuelo?"
    );
    if (confirmDelete) {
      setMessage(null);
      const res = await deleteAdminVuelo(id);

      if (res && res.success) {
        setMessage({ type: "success", text: res.message });
        if (editingVueloId === id) {
          resetForm(); // Esto también cerrará el modal si estaba abierto para este vuelo
        }
      } else if (res && res.message) {
        setMessage({ type: "error", text: res.message });
      }
    }
  };

  const handleEdit = (vueloToEdit) => {
    setEditingVueloId(vueloToEdit._id || vueloToEdit.id);
    setFormData({
      origen: vueloToEdit.origen || "", // No requerido para actualizar
      destino: vueloToEdit.destino || "", // No requerido para actualizar
      fechaSalida: vueloToEdit.fechaSalida || "",
      hora: vueloToEdit.hora || "", // Cargar la hora
      avion: vueloToEdit.avion || "",
      costo: vueloToEdit.costo || "",
      piloto: vueloToEdit.piloto || "",
      copiloto: vueloToEdit.copiloto || "",
      azafata1: vueloToEdit.azafata1 || "",
      azafata2: vueloToEdit.azafata2 || "",
      azafata3: vueloToEdit.azafata3 || "",
      // imagen: vueloToEdit.imagen || null, // No cargar imagen al editar si no se va a manejar
    });
    setShowModal(true);
  };

  // Manejo de mensajes de error/éxito del contexto
  useEffect(() => {
    if (error) {
      setMessage({ type: "error", text: error });
    }
    // También maneja errores del contexto de usuarios
    if (errorUsers) {
      setMessage({ type: "error", text: errorUsers });
    }
  }, [error, errorUsers]);

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-700">Cargando datos...</p>
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
          <p className="text-gray-400 text-sm">Gestión general del sistema</p>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          Gestión de Vuelos
        </h1>

        {/* Mensajes de notificación */}
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

        {/* Botón para abrir el modal de creación */}
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-md mb-8"
        >
          Crear Nuevo Vuelo
        </button>

        {/* Modal para Crear/Editar Vuelo */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {editingVueloId !== null
                    ? "Editar Vuelo"
                    : "Crear Nuevo Vuelo"}
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
                {/* Origen */}
                <div className="relative">
                  {" "}
                  {/* Añadido div para el label */}
                  <label
                    htmlFor="origen"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Origen
                  </label>
                  <input
                    type="text"
                    id="origen" // Agregado ID para asociar con el label
                    name="origen"
                    placeholder="Origen"
                    value={formData.origen}
                    onChange={handleChange}
                    // required={!editingVueloId} // Solo requerido para creación
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Destino */}
                <div className="relative">
                  <label
                    htmlFor="destino"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Destino
                  </label>
                  <input
                    type="text"
                    id="destino"
                    name="destino"
                    placeholder="Destino"
                    value={formData.destino}
                    onChange={handleChange}
                    // required={!editingVueloId} // Solo requerido para creación
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Fecha Salida */}
                <div className="relative">
                  <label
                    htmlFor="fechaSalida"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Fecha de Salida
                  </label>
                  <input
                    type="date"
                    id="fechaSalida"
                    name="fechaSalida"
                    value={formData.fechaSalida}
                    onChange={handleChange}
                    // required={!editingVueloId} // Solo requerido para creación
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Hora */}
                <div className="relative">
                  <label
                    htmlFor="hora"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Hora de Salida
                  </label>
                  <input
                    type="time" // Tipo de input para hora
                    id="hora"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    // required={!editingVueloId} // Solo requerido para creación
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Avión */}
                <div className="relative">
                  <label
                    htmlFor="avion"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Avión
                  </label>
                  <input
                    type="text" // Cambiado de select a input type="text"
                    id="avion"
                    name="avion"
                    placeholder="Ej: Boeing 747" // Placeholder más apropiado
                    value={formData.avion}
                    onChange={handleChange}
                    required={!editingVueloId} // Mantén si es requerido para la creación
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>

                {/* Costo */}
                <div className="relative">
                  <label
                    htmlFor="costo"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Costo USD
                  </label>
                  <input
                    type="number"
                    id="costo"
                    name="costo"
                    placeholder="Costo USD"
                    value={formData.costo}
                    onChange={handleChange}
                    // required={!editingVueloId} // Solo requerido para creación
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  />
                </div>
                {/* Piloto */}
                <div className="relative">
                  <label
                    htmlFor="piloto"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Piloto
                  </label>
                  <select
                    id="piloto"
                    name="piloto"
                    value={formData.piloto}
                    onChange={handleChange}
                    required={!editingVueloId}
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  >
                    <option value="">Seleccionar Piloto</option>
                    {pilotos.map(
                      (
                        piloto // 'piloto' es ahora un objeto de usuario
                      ) => (
                        <option key={piloto._id} value={piloto._id}>
                          {" "}
                          {/* El value debe ser el ID */}
                          {`${piloto.nombre} ${piloto.apellido}`}{" "}
                          {/* Lo que se muestra al usuario */}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Copiloto */}
                <div className="relative">
                  <label
                    htmlFor="copiloto"
                    className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                  >
                    Copiloto
                  </label>
                  <select
                    id="copiloto"
                    name="copiloto"
                    value={formData.copiloto} // formData.copiloto ahora debe almacenar el _id del copiloto
                    onChange={handleChange}
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                  >
                    <option value="">Seleccionar Copiloto</option>
                    {pilotos.map(
                      (
                        copiloto // 'copiloto' es ahora un objeto de usuario
                      ) => (
                        <option key={copiloto._id} value={copiloto._id}>
                          {`${copiloto.nombre} ${copiloto.apellido}`}
                        </option>
                      )
                    )}
                  </select>
                </div>
                {/* Azafata 1 */}
                <div className="grid md:grid-cols-3 gap-4 col-span-full">
                  {/* Azafata 1 */}
                  <div className="relative">
                    <label
                      htmlFor="azafata1"
                      className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                    >
                      Azafata 1
                    </label>
                    <select
                      id="azafata1"
                      name="azafata1"
                      value={formData.azafata1}
                      onChange={handleChange}
                      className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                      // REMOVIDO: No hay 'required' aquí, lo que lo hace opcional
                    >
                      <option value="">Azafata 1</option>{" "}
                      {/* Esta opción con value="" es crucial */}
                      {azafatas.map((azafata) => (
                        <option key={azafata._id} value={azafata._id}>
                          {`${azafata.nombre} ${azafata.apellido}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Azafata 2 */}
                  <div className="relative">
                    <label
                      htmlFor="azafata2"
                      className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                    >
                      Azafata 2
                    </label>
                    <select
                      id="azafata2"
                      name="azafata2"
                      value={formData.azafata2}
                      onChange={handleChange}
                      className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                      // REMOVIDO: No hay 'required' aquí
                    >
                      <option value="">Azafata 2</option>
                      {azafatas.map((azafata) => (
                        <option key={azafata._id} value={azafata._id}>
                          {`${azafata.nombre} ${azafata.apellido}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Azafata 3 */}
                  <div className="relative">
                    <label
                      htmlFor="azafata3"
                      className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
                    >
                      Azafata 3
                    </label>
                    <select
                      id="azafata3"
                      name="azafata3"
                      value={formData.azafata3}
                      onChange={handleChange}
                      className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
                      // REMOVIDO: No hay 'required' aquí
                    >
                      <option value="">Azafata 3</option>
                      {azafatas.map((azafata) => (
                        <option key={azafata._id} value={azafata._id}>
                          {`${azafata.nombre} ${azafata.apellido}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Botón de Submit */}
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white py-4 rounded-md mt-6 w-full col-span-full"
                >
                  {editingVueloId !== null
                    ? "Actualizar Vuelo"
                    : "Agregar Vuelo"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Sección de Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Filtros de Vuelos
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Filtro por Destino */}
            <div className="relative">
              <label
                htmlFor="filterDestino"
                className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
              >
                Filtrar por Destino
              </label>
              <input
                type="text"
                id="filterDestino"
                placeholder="Filtrar por Destino"
                value={filterDestino}
                onChange={(e) => setFilterDestino(e.target.value)}
                className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
              />
            </div>
            {/* Filtro por Fecha */}
            <div className="relative">
              <label
                htmlFor="filterFecha"
                className="absolute -top-3 left-3 bg-white px-1 text-xs text-gray-600"
              >
                Filtrar por Fecha
              </label>
              <input
                type="date"
                id="filterFecha"
                placeholder="Filtrar por Fecha"
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value)}
                className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 text-gray-900 w-full"
              />
            </div>
          </div>
        </div>

        {/* Lista de vuelos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVuelos.length === 0 && !loading ? (
            <p className="text-gray-600 text-center col-span-full">
              No hay vuelos que coincidan con los filtros.
            </p>
          ) : (
            filteredVuelos.map((vuelo) => (
              <div
                key={vuelo._id || vuelo.id}
                className="bg-gray-200 border border-gray-300 rounded-lg p-4 shadow-md"
              >
                {vuelo.imagen && (
                  <img
                    src={vuelo.imagen}
                    alt="Avión"
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {vuelo.origen} a {vuelo.destino}
                </h3>
                <p className="text-gray-600">
                  Fecha: {vuelo.fechaSalida} Hora: {vuelo.hora}
                </p>{" "}
                {/* Mostrar hora */}
                <p className="text-gray-600">Precio: ${vuelo.costo}</p>
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => handleEdit(vuelo)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(vuelo._id || vuelo.id)}
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

export default AdminVuelosPage;
