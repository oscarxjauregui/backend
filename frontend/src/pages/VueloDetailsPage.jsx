import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useVuelo } from "../context/VueloByIdContext";
import { useAuth } from "../context/AuthContext";
import { createCheckoutSession } from "../api/payment";
import { createReservacionRequest } from "../api/reservaciones";

import PayPalPaymentButton from "../components/PayPalPaymentButton";

function VueloDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vuelo, loading, error, fetchVueloById } = useVuelo();
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    equipajeMano: 0,
    equipajeFacturado: 0,
    asientos: 1,
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [reserving, setReserving] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [formValidationError, setFormValidationError] = useState("");

  const [payPalPaymentSuccess, setPayPalPaymentSuccess] = useState(false);
  const [payPalPaymentError, setPayPalPaymentError] = useState(null);
  const [payPalProcessing, setPayPalProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVueloById(id);
    }
  }, [id, fetchVueloById]);

  const totalCost = useMemo(() => {
    if (!vuelo || typeof vuelo.costo !== "number") {
      return 0;
    }
    const numberOfSeats = parseInt(formData.asientos, 10);
    if (isNaN(numberOfSeats) || numberOfSeats <= 0) {
      return 0;
    }
    return vuelo.costo * numberOfSeats;
  }, [vuelo, formData.asientos]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      let date;
      date = new Date(dateString);

      if (
        isNaN(date.getTime()) &&
        dateString.includes("/") &&
        dateString.includes(" ")
      ) {
        const [datePart, timePart] = dateString.split(" ");
        const [day, month, year] = datePart.split("/");
        date = new Date(`${year}-${month}-${day}T${timePart}:00`);
      } else if (isNaN(date.getTime()) && dateString.includes("/")) {
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

  const validateForm = () => {
    const seatsNumber = parseInt(formData.asientos, 10);
    if (seatsNumber <= 0 || isNaN(seatsNumber)) {
      return "El número de asientos debe ser al menos 1.";
    }
    if (vuelo && seatsNumber > vuelo.asientosDisponibles) {
      return `Solo hay ${vuelo.asientosDisponibles} asientos disponibles para este vuelo.`;
    }
    return "";
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate(`/login?redirectTo=/reservar/${id}&action=confirmar`);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFormValidationError(validationError);
      setReservationSuccess(false);
      return;
    }

    setFormValidationError(null);
    setReservationError(null);
    setReservationSuccess(false);
    setReserving(true);

    try {
      const sessionData = {
        name: `Vuelo de ${vuelo.origen} a ${vuelo.destino}`,
        description: `Salida: ${formatDate(
          vuelo.fechaSalida
        )} | Llegada: ${formatDate(vuelo.fechaLlegada)}`,
        unit_amount: Math.round(vuelo.costo * 100),
        quantity: formData.asientos,
        vueloId: id,
        userId: user ? user.id : null,
      };

      const response = await createCheckoutSession(sessionData);

      if (response && response.url) {
        window.location.href = response.url;
      } else {
        throw new Error(
          "No se recibió una URL de sesión de Stripe del backend."
        );
      }
    } catch (apiError) {
      console.error(
        "Error al iniciar el proceso de pago con Stripe:",
        apiError
      );
      const errorMessage =
        apiError.response?.data?.message ||
        apiError.message ||
        "Error al iniciar el proceso de pago. Inténtalo de nuevo.";
      setReservationError(errorMessage);
      setReservationSuccess(false);
    } finally {
      setReserving(false);
    }
  };

  const handlePayPalSuccess = (newReservation) => {
    console.log(
      "PayPal payment successful and reservation created:",
      newReservation
    );
    setPayPalPaymentSuccess(true);
    setPayPalPaymentError(null);
    setPayPalProcessing(false);
    navigate("/myreservations?payment=success");
  };

  const handlePayPalError = (message) => {
    console.error("PayPal payment error:", message);
    setPayPalPaymentError(message);
    setPayPalPaymentSuccess(false);
    setPayPalProcessing(false);
  };

  const handlePayPalProcessing = (isProcessing) => {
    setPayPalProcessing(isProcessing);
    if (isProcessing) {
      setPayPalPaymentError(null);
      setFormValidationError(null);
    }
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-16">
      <main className="flex-grow container mx-auto px-6 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">Reservar Vuelo</h1>

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

        {!reservationSuccess && !payPalPaymentSuccess ? (
          <form
            onSubmit={handleConfirmReservation}
            className="bg-gray-100 p-6 rounded-2xl shadow-md border border-gray-200 space-y-6"
          >
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
                  max={vuelo.asientosDisponibles}
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

            <div className="text-center border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-2xl font-bold text-blue-600">
                Total a Pagar: ${totalCost.toFixed(2)} MXN
              </h2>
            </div>

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
            {payPalPaymentError && (
              <p className="text-red-600 font-medium text-center">
                {payPalPaymentError}
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
                    payPalProcessing ||
                    !isAuthenticated ||
                    !vuelo ||
                    parseInt(formData.asientos, 10) <= 0 ||
                    parseInt(formData.asientos, 10) > vuelo.asientosDisponibles
                  }
                >
                  {reserving
                    ? "Procesando Pago..."
                    : isAuthenticated
                    ? "Proceder al Pago con Stripe"
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

            {isAuthenticated && totalCost > 0 && (
              <div className="flex items-center my-8">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">
                  O Pagar con PayPal
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
            )}

            {isAuthenticated &&
              totalCost > 0 &&
              parseInt(formData.asientos, 10) > 0 &&
              parseInt(formData.asientos, 10) <= vuelo.asientosDisponibles && (
                <div className="text-center">
                  <PayPalPaymentButton
                    totalAmount={totalCost}
                    vueloDetails={vuelo}
                    formData={formData}
                    userId={user ? user.id : null}
                    onPaymentSuccess={handlePayPalSuccess}
                    onPaymentError={handlePayPalError}
                    onPaymentProcessing={setPayPalProcessing}
                  />
                </div>
              )}
          </form>
        ) : (
          <div className="bg-green-100 p-6 rounded-2xl shadow-md border border-green-200 text-center text-green-800">
            <h2 className="text-2xl font-bold mb-4">¡Pago Exitoso!</h2>
            <p className="mt-2">
              Tu reserva ha sido confirmada. Revisa tus reservas en la sección
              "Mis Reservas".
            </p>
            <p className="mt-4">
              <Link
                to="/myreservations"
                className="text-blue-600 hover:underline font-medium"
              >
                Ir a Mis Reservas
              </Link>
            </p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 transition duration-150"
          >
            &larr; Volver a la página principal
          </Link>
        </div>
      </main>
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
