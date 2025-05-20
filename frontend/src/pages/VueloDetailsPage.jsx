// src/pages/VueloDetailsPage.jsx
import { useEffect, useState, useCallback, useMemo } from "react"; // Importa useMemo
import { useParams, Link, useNavigate } from "react-router-dom";
import { useVuelo } from "../context/VueloByIdContext";
import { useAuth } from "../context/AuthContext";
import { createReservacion } from "../api/reservaciones"; // Asumiendo que esta función de API existe y funciona

// Opcional: Si tu Navbar no es global, impórtala aquí
// import Navbar from "../components/Navbar";

function VueloDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vuelo, loading, error, fetchVueloById } = useVuelo();
  const { isAuthenticated, user } = useAuth(); // Obtén el usuario del AuthContext

  // Estado para los datos del formulario de reserva
  const [formData, setFormData] = useState({
    equipajeMano: 0,
    equipajeFacturado: 0,
    asientos: 1, // Por defecto 1 asiento
    cardholderName: "", // Nuevo campo para el nombre del titular de la tarjeta
    cardNumber: "",
    expiryDate: "", // Formato MM/AA
    cvv: "",
  });

  const [reserving, setReserving] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [formValidationError, setFormValidationError] = useState(""); // Estado para errores de validación del formulario

  // Efecto para obtener los detalles del vuelo cuando el ID cambia
  useEffect(() => {
    if (id) {
      fetchVueloById(id);
    }
  }, [id, fetchVueloById]);

  // Calcula el costo total cuando el vuelo o la cantidad de asientos cambian
  const totalCost = useMemo(() => {
    if (!vuelo || typeof vuelo.costo !== "number") {
      return 0;
    }
    const numberOfSeats = parseInt(formData.asientos, 10);
    if (isNaN(numberOfSeats) || numberOfSeats <= 0) {
      return 0;
    }
    // Asumiendo que `vuelo.costo` es el costo por asiento
    return vuelo.costo * numberOfSeats;
  }, [vuelo, formData.asientos]);

  // Función para formatear fechas para mostrar
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Formato de 12 horas con AM/PM
      };

      let date;
      // Intenta parsear como fecha ISO primero
      date = new Date(dateString);

      // Si falla y parece ser "DD/MM/YYYY HH:mm"
      if (
        isNaN(date.getTime()) &&
        dateString.includes("/") &&
        dateString.includes(" ")
      ) {
        const [datePart, timePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("/");
        // Reconstruye a un formato que `new Date()` pueda parsear mejor (YYYY-MM-DDTHH:mm)
        date = new Date(`${year}-${month}-${day}T${timePart}:00`);
      } else if (isNaN(date.getTime()) && dateString.includes("/")) {
        // Maneja "DD/MM/YYYY" sin tiempo
        const [day, month, year] = dateString.split("/");
        date = new Date(`${year}-${month}-${day}`);
      }

      if (!isNaN(date.getTime())) {
        return date.toLocaleString("es-ES", options);
      }
      return "Fecha inválida";
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Fecha inválida";
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "asientos" ||
        name === "equipajeMano" ||
        name === "equipajeFacturado"
          ? parseInt(value, 10) || 0
          : value,
    });
    if (formValidationError) {
      setFormValidationError("");
    }
  };

  // Función para validar el formulario de reserva
  const validateForm = () => {
    const cardNumberRegex = /^\d{16}$/;
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/AA
    const cvvRegex = /^\d{3}$/;
    const seatsNumber = parseInt(formData.asientos, 10);
    console.log(
      "Value of seatsNumber:",
      seatsNumber,
      "Type:",
      typeof seatsNumber
    ); // Add this line
    if (seatsNumber <= 0 || isNaN(seatsNumber)) {
      return "El número de asientos debe ser al menos 1.";
    }
    if (vuelo && seatsNumber > vuelo.asientosDisponibles) {
      return `Solo hay ${vuelo.asientosDisponibles} asientos disponibles para este vuelo.`;
    }
    if (!formData.cardholderName.trim()) {
      return "Por favor, ingresa el nombre del titular de la tarjeta.";
    }
    if (!cardNumberRegex.test(formData.cardNumber)) {
      return "El número de tarjeta debe tener 16 dígitos.";
    }
    if (!expiryDateRegex.test(formData.expiryDate)) {
      return "La fecha de vencimiento debe estar en formato MM/AA.";
    }
    // Validación básica de fecha de vencimiento (año y mes)
    const [month, year] = formData.expiryDate.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100; // Últimos dos dígitos del año actual
    const currentMonth = new Date().getMonth() + 1; // getMonth() es 0-indexado
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "La tarjeta ha expirado.";
    }
    if (!cvvRegex.test(formData.cvv)) {
      return "El CVV debe tener 3 dígitos.";
    }

    return ""; // Retorna string vacío si la validación pasa
  };

  // Manejador para confirmar la reserva
  const handleConfirmReservation = async (e) => {
    e.preventDefault(); // Evita el envío predeterminado del formulario

    if (!isAuthenticated) {
      // Redirige a login, pasando la URL actual y la acción
      navigate(`/login?redirectTo=/reservar/${id}&action=confirmar`);
      return;
    }

    // Realiza la validación del formulario
    const validationError = validateForm();
    if (validationError) {
      setFormValidationError(validationError);
      setReservationSuccess(false); // Oculta el mensaje de éxito si estaba visible
      return;
    }

    // Limpia errores previos y activa el estado de 'reservando'
    setFormValidationError(null);
    setReservationError(null);
    setReservationSuccess(false);
    setReserving(true);

    try {
      // Llama a tu API de backend para crear la reserva
      // La función createReservacion asume que toma el ID del vuelo y el número de asientos
      // Podrías necesitar modificar tu API para aceptar información de equipaje y pago
      await createReservacion(id, formData.asientos);

      setReservationSuccess(true);
      // Opcionalmente, vuelve a cargar los detalles del vuelo para actualizar los asientos disponibles
      fetchVueloById(id);
    } catch (apiError) {
      console.error("Error en handleConfirmReservation:", apiError);
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        apiError ||
        "Error al procesar la reserva. Inténtalo de nuevo.";
      setReservationError(errorMessage);
      setReservationSuccess(false); // Asegura que el éxito sea falso en caso de error
    } finally {
      setReserving(false);
    }
  };

  // --- Renderizado para estados de Carga, Error, Vuelo no encontrado ---
  if (loading) {
    return (
      <div className="bg-gray-50 text-gray-900 font-sans pt-16 min-h-screen flex justify-center items-center">
        <p className="text-xl text-gray-600">Cargando detalles del vuelo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 text-gray-900 font-sans pt-16 min-h-screen flex flex-col justify-center items-center">
        <p className="text-xl text-red-600 mb-4">
          Error al cargar vuelo: {error}
        </p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Volver a la página principal
        </Link>
      </div>
    );
  }

  if (!vuelo) {
    return (
      <div className="bg-gray-50 text-gray-900 font-sans pt-16 min-h-screen flex flex-col justify-center items-center">
        <p className="text-xl text-gray-600 mb-4">Vuelo no encontrado.</p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Volver a la página principal
        </Link>
      </div>
    );
  }

  // --- Renderizado principal de detalles del vuelo y formulario de reserva ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16">
      {" "}
      {/* Agregado pt-16 para Navbar fija */}
      {/* <Navbar /> {/* Descomenta si tu Navbar no es global */}
      <main className="flex-grow container mx-auto px-6 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">Reservar Vuelo</h1>

        {/* Sección de Detalles del Vuelo */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4">
            Detalles del Vuelo Seleccionado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong>Origen:</strong> {vuelo.origen}
            </p>
            <p>
              <strong>Destino:</strong> {vuelo.destino}
            </p>
            <p>
              <strong>Fecha de Salida:</strong> {formatDate(vuelo.fechaSalida)}
            </p>
            <p>
              <strong>Fecha de Llegada:</strong>{" "}
              {formatDate(vuelo.fechaLlegada)}
            </p>
            <p>
              <strong>Aerolínea:</strong> {vuelo.aerolinea}
            </p>
            <p>
              <strong>Avión:</strong> {vuelo.avion}
            </p>
            <p>
              <strong>Estado:</strong> {vuelo.estado}
            </p>
            <p>
              <strong>Asientos Disponibles:</strong>{" "}
              <span
                className={
                  vuelo.asientosDisponibles > 10
                    ? "text-green-600 font-bold"
                    : vuelo.asientosDisponibles > 0
                    ? "text-yellow-600 font-bold"
                    : "text-red-600 font-bold"
                }
              >
                {vuelo.asientosDisponibles}
              </span>
            </p>
            <p>
              <strong>Costo por Asiento:</strong> $
              {vuelo.costo ? vuelo.costo.toFixed(2) : "N/A"} MXN
            </p>
          </div>
        </div>

        {/* Formulario de Reserva (si no está confirmado) */}
        {!reservationSuccess ? (
          <form
            onSubmit={handleConfirmReservation}
            className="bg-gray-100 p-6 rounded-2xl shadow-md border border-gray-200 space-y-6"
          >
            {/* Sección Datos del Pasajero (solo muestra información) */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Datos del Pasajero</h2>
              {isAuthenticated && user ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>
                    <strong>Nombre:</strong> {user.nombre} {user.apellido}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {user.telefono || "N/A"}
                  </p>{" "}
                  {/* Añade N/A si no hay datos */}
                  <p>
                    <strong>Pasaporte:</strong> {user.pasaporte || "N/A"}
                  </p>
                </div>
              ) : (
                <p className="text-red-600 font-medium">
                  Debes{" "}
                  <Link
                    to={`/login?redirectTo=/reservar/${id}&action=confirmar`}
                    className="underline"
                  >
                    iniciar sesión
                  </Link>{" "}
                  para ver tus datos de pasajero y reservar.
                </p>
              )}
            </section>

            {/* Sección Número de Asientos */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Número de Asientos</h2>
              <label className="block">
                <span className="text-gray-700">Asientos a reservar:</span>
                <input
                  name="asientos"
                  value={formData.asientos}
                  onChange={handleInputChange}
                  type="number"
                  min="1"
                  max={vuelo.asientosDisponibles} // Limita al número de asientos disponibles
                  placeholder="Cantidad de asientos"
                  className="mt-1 block w-full md:w-1/4 p-3 border border-gray-300 rounded-xl"
                />
              </label>
              {vuelo.asientosDisponibles > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Actualmente disponibles: {vuelo.asientosDisponibles}
                </p>
              )}
            </section>

            {/* Sección Equipaje */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Equipaje</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-gray-700">Maletas de mano:</span>
                  <input
                    name="equipajeMano"
                    value={formData.equipajeMano}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-xl"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Maletas facturadas:</span>
                  <input
                    name="equipajeFacturado"
                    value={formData.equipajeFacturado}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-xl"
                  />
                </label>
              </div>
            </section>

            {/* Sección Datos de Pago */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Datos de Pago</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block md:col-span-2">
                  <span className="text-gray-700">
                    Nombre del titular de la tarjeta:
                  </span>
                  <input
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    placeholder="Nombre completo en la tarjeta"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-xl"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-gray-700">
                    Número de tarjeta (16 dígitos):
                  </span>
                  <input
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="Número de tarjeta"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-xl"
                    maxLength="16"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Vencimiento (MM/AA):</span>
                  <input
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/AA"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-xl"
                    maxLength="5"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">CVV (3 dígitos):</span>
                  <input
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="CVV"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-xl"
                    maxLength="3"
                  />
                </label>
              </div>
            </section>

            {/* Sección de Costo Total */}
            <div className="text-center border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-2xl font-bold text-blue-600">
                Total a Pagar: ${totalCost.toFixed(2)} MXN
              </h2>
            </div>

            {/* Mensajes de error y botón de confirmación */}
            {formValidationError && (
              <p className="text-red-600 font-medium text-center">
                {formValidationError}
              </p>
            )}
            {reservationError && (
              <p className="text-red-600 font-medium text-center">
                {reservationError}
              </p>
            )}

            <div className="text-center mt-6">
              {vuelo.asientosDisponibles > 0 &&
              parseInt(formData.asientos, 10) > 0 &&
              parseInt(formData.asientos, 10) <= vuelo.asientosDisponibles ? (
                <button
                  type="submit"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    reserving ||
                    !isAuthenticated ||
                    !vuelo ||
                    parseInt(formData.asientos, 10) <= 0 ||
                    parseInt(formData.asientos, 10) > vuelo.asientosDisponibles
                  }
                >
                  {reserving
                    ? "Procesando Reserva..."
                    : isAuthenticated
                    ? "Confirmar Reserva"
                    : "Iniciar Sesión para Reservar"}
                </button>
              ) : (
                <p className="text-red-600 font-semibold text-lg">
                  {vuelo.asientosDisponibles <= 0
                    ? "No hay asientos disponibles para este vuelo."
                    : "Por favor, selecciona un número válido de asientos."}
                </p>
              )}
            </div>
            {!isAuthenticated && (
              <p className="text-center text-gray-600 text-sm mt-4">
                Debes iniciar sesión para completar la reserva.
              </p>
            )}
          </form>
        ) : (
          // Mensaje de éxito de la reserva
          <div className="bg-green-100 p-6 rounded-2xl shadow-md border border-green-200 text-center text-green-800">
            <h2 className="text-2xl font-bold mb-4">¡Reserva Confirmada!</h2>
            {user && (
              <p>
                Gracias por tu compra, {user.nombre} {user.apellido}.
              </p>
            )}
            <p className="mt-2">
              Tu reserva para el vuelo {vuelo.origen} - {vuelo.destino} ha sido
              procesada exitosamente.
            </p>
            <p className="mt-4">
              <Link
                to="/myreservations"
                className="text-blue-600 hover:underline font-medium"
              >
                Ver mis reservaciones
              </Link>
            </p>
          </div>
        )}

        {/* Enlace para volver a la página principal */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 transition duration-150"
          >
            &larr; Volver a la página principal
          </Link>
        </div>
      </main>
      {/* Footer (copiado de tu ejemplo de Reservas) */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p className="text-lg">
          ¿Tienes dudas? Escríbenos a contacto@aerolinea.com
        </p>
        <p className="text-sm mt-2">
          &copy; {new Date().getFullYear()} Aerolínea. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
}

export default VueloDetailsPage;
