import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAdminVuelos } from "../context/AdminVuelosContex"; // Asegúrate de que la ruta sea correcta

const AdminVuelosPage = () => {
  const {
    vuelos,
    loading,
    error,
    createAdminVuelo,
    updateAdminVuelo,
    deleteAdminVuelo,
  } = useAdminVuelos();

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
    imagen: null, // Cambié la imagen a un estado de archivo
  });

  const [editingVueloId, setEditingVueloId] = useState(null);
  const [showModal, setShowModal] = useState(false); // Nuevo estado para controlar la visibilidad del modal
  const [message, setMessage] = useState(null);

  // Estados para los filtros
  const [filterDestino, setFilterDestino] = useState("");
  const [filterFecha, setFilterFecha] = useState("");
  const [filteredVuelos, setFilteredVuelos] = useState([]);

  // Opciones para el avión, piloto, copiloto y azafatas
  const aviones = ["Avión A", "Avión B", "Avión C"];
  const pilotos = ["Piloto A", "Piloto B", "Piloto C"];
  const copilotos = ["Copiloto A", "Copiloto B", "Copiloto C"];
  const azafatas = ["Azafata 1", "Azafata 2", "Azafata 3"];

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Si necesitas enviar el archivo directamente al backend:
      setFormData({ ...formData, imagen: file });
      // Si solo necesitas la URL para mostrarla en el frontend antes de subir:
      // setFormData({ ...formData, imagen: URL.createObjectURL(file) });
    }
  };

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
      imagen: null,
    });
    setEditingVueloId(null);
    setShowModal(false); // Ocultar el modal al resetear el formulario
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Si tu API espera FormData para enviar archivos, tendrías que construirlo así:
    const dataToSend = new FormData();
    for (const key in formData) {
      dataToSend.append(key, formData[key]);
    }

    let res;
    if (editingVueloId) {
      const confirmUpdate = window.confirm(
        "¿Estás seguro de que deseas actualizar este vuelo?"
      );
      if (confirmUpdate) {
        // Pasa dataToSend si tu API espera FormData para la actualización
        res = await updateAdminVuelo(editingVueloId, dataToSend);
      }
    } else {
      // Pasa dataToSend si tu API espera FormData para la creación
      res = await createAdminVuelo(dataToSend);
    }

    if (res && res.success) {
      setMessage({ type: "success", text: res.message });
      resetForm(); // Resetear y ocultar el modal
      // No necesitamos isFormVisible, showModal lo maneja
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
      origen: vueloToEdit.origen,
      destino: vueloToEdit.destino,
      fechaSalida: vueloToEdit.fechaSalida,
      avion: vueloToEdit.avion,
      costo: vueloToEdit.costo,
      piloto: vueloToEdit.piloto,
      copiloto: vueloToEdit.copiloto,
      azafata1: vueloToEdit.azafata1,
      azafata2: vueloToEdit.azafata2,
      azafata3: vueloToEdit.azafata3,
      imagen: vueloToEdit.imagen || null, // Mantener la imagen si existe
    });
    setShowModal(true); // Mostrar el modal al editar
  };

  // Manejo de mensajes de error/éxito del contexto
  useEffect(() => {
    if (error) {
      setMessage({ type: "error", text: error });
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-700">Cargando vuelos...</p>
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
            resetForm(); // Limpiar el formulario antes de crear
            setShowModal(true); // Mostrar el modal
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
                  onClick={() => resetForm()} // Cierra el modal y resetea el formulario
                  className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                  &times; {/* Carácter 'x' para cerrar */}
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-6"
              >
                <input
                  type="text"
                  name="origen"
                  placeholder="Origen"
                  value={formData.origen}
                  onChange={handleChange}
                  required
                  className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
                <input
                  type="text"
                  name="destino"
                  placeholder="Destino"
                  value={formData.destino}
                  onChange={handleChange}
                  required
                  className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
                <input
                  type="date"
                  name="fechaSalida"
                  value={formData.fechaSalida}
                  onChange={handleChange}
                  required
                  className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
                <select
                  name="avion"
                  value={formData.avion}
                  onChange={handleChange}
                  required
                  className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                >
                  <option value="">Seleccionar Avión</option>
                  {aviones.map((avion, index) => (
                    <option key={index} value={avion}>
                      {avion}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="costo"
                  placeholder="Costo USD"
                  value={formData.costo}
                  onChange={handleChange}
                  required
                  className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
                <select
                  name="piloto"
                  value={formData.piloto}
                  onChange={handleChange}
                  required
                  className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                >
                  <option value="">Seleccionar Piloto</option>
                  {pilotos.map((piloto, index) => (
                    <option key={index} value={piloto}>
                      {piloto}
                    </option>
                  ))}
                </select>
                <select
                  name="copiloto"
                  value={formData.copiloto}
                  onChange={handleChange}
                  required
                  className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                >
                  <option value="">Seleccionar Copiloto</option>
                  {copilotos.map((copiloto, index) => (
                    <option key={index} value={copiloto}>
                      {copiloto}
                    </option>
                  ))}
                </select>
                <div className="grid md:grid-cols-3 gap-4 col-span-full">
                  <select
                    name="azafata1"
                    value={formData.azafata1}
                    onChange={handleChange}
                    required
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="">Azafata 1</option>
                    {azafatas.map((azafata, index) => (
                      <option key={index} value={azafata}>
                        {azafata}
                      </option>
                    ))}
                  </select>
                  <select
                    name="azafata2"
                    value={formData.azafata2}
                    onChange={handleChange}
                    required
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="">Azafata 2</option>
                    {azafatas.map((azafata, index) => (
                      <option key={index} value={azafata}>
                        {azafata}
                      </option>
                    ))}
                  </select>
                  <select
                    name="azafata3"
                    value={formData.azafata3}
                    onChange={handleChange}
                    required
                    className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                  >
                    <option value="">Azafata 3</option>
                    {azafatas.map((azafata, index) => (
                      <option key={index} value={azafata}>
                        {azafata}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="file"
                  name="imagen"
                  onChange={handleImageChange}
                  className="p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 col-span-full"
                />
                {/* Opcional: Mostrar imagen actual si estamos editando y hay una imagen */}
                {editingVueloId && typeof formData.imagen === "string" && (
                  <div className="col-span-full">
                    <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                    <img
                      src={formData.imagen}
                      alt="Imagen actual del vuelo"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}
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
            <input
              type="text"
              placeholder="Filtrar por Destino"
              value={filterDestino}
              onChange={(e) => setFilterDestino(e.target.value)}
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
            <input
              type="date"
              placeholder="Filtrar por Fecha"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
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
                <p className="text-gray-600">Fecha: {vuelo.fechaSalida}</p>
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
