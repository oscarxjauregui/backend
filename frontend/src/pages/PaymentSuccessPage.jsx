// src/pages/PaymentSuccessPage.jsx
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createReservacionRequest } from "../api/reservaciones";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("Procesando tu reserva...");
  const [reservationStatus, setReservationStatus] = useState("pending");
  // --- REAFIRMACIÓN DEL useRef ---
  const hasReservationBeenProcessed = useRef(false);

  useEffect(() => {
    console.log("useEffect - PaymentSuccessPage - Ejecutado.");
    console.log(
      "hasReservationBeenProcessed.current (al inicio del efecto):",
      hasReservationBeenProcessed.current
    );

    if (hasReservationBeenProcessed.current) {
      console.log("useEffect - Booking already processed, skipping.");
      return;
    }

    const vueloId = searchParams.get("vueloId");
    const userIdFromUrl = searchParams.get("userId");
    const asientos = parseInt(searchParams.get("asientos"), 10);

    console.log("PaymentSuccessPage - URL Params:", {
      vueloId,
      userIdFromUrl,
      asientos,
    });
    console.log("PaymentSuccessPage - Current User ID:", user?.id);

    if (!vueloId || !userIdFromUrl || isNaN(asientos) || asientos < 1) {
      setMessage(
        "Error: Datos incompletos o inválidos para procesar la reserva desde la URL."
      );
      setReservationStatus("failed");
      console.error(
        "Faltan o son inválidos los parámetros de la URL para crear la reserva."
      );
      hasReservationBeenProcessed.current = true; // Marcar como procesado incluso si hay un error de validación
      return;
    }

    if (!user || user.id !== userIdFromUrl) {
      setMessage(
        "Error: No autorizado o datos de usuario no coinciden. Por favor, inicia sesión con la cuenta correcta."
      );
      setReservationStatus("failed");
      console.error("Error de autenticación o ID de usuario no coincide.");
      hasReservationBeenProcessed.current = true; // Marcar como procesado
      return;
    }

    if (reservationStatus === "pending") {
      setMessage("¡Pago exitoso! Intentando crear tu reserva...");
      setReservationStatus("processing");

      // --- IMPORTANTE: MARCAMOS EL REF *ANTES* DE LA LLAMADA ASÍNCRONA ---
      // Esto previene que una re-ejecución inmediata intente llamar de nuevo
      hasReservationBeenProcessed.current = true;
      console.log(
        "createReservation - hasReservationBeenProcessed.current set to true (antes de la llamada API)."
      );

      const createReservation = async () => {
        try {
          console.log(
            "createReservation - Llamando a la API para crear reserva..."
          );
          const res = await createReservacionRequest(vueloId, { asientos });

          // --- DEPURACIÓN: QUÉ VALORES TIENE 'res' REALMENTE ---
          console.log(
            "Respuesta de createReservacionRequest - res.status:",
            res.status
          );
          console.log(
            "Respuesta de createReservacionRequest - res.data:",
            res.data
          );

          if (res.status >= 200 && res.status < 300) {
            // Un rango más general de éxito para Axios (200-299)
            setMessage("¡Tu reserva ha sido creada exitosamente!");
            setReservationStatus("success");
            console.log("Reserva creada con éxito (dentro de if):", res.data);
          } else {
            // Este bloque solo debería alcanzarse si el servidor envía un 2xx pero no un 201 (raro)
            // o si res.status no es un número (lo cual sería un error de Axios)
            setMessage(
              `Error inesperado al crear la reserva: ${
                res.data?.message || "Error desconocido"
              }`
            );
            setReservationStatus("failed");
            console.error(
              "Respuesta inesperada del servidor (dentro de else):",
              res
            );
          }
        } catch (error) {
          console.error(
            "Error al llamar a createReservacionRequest (catch):",
            error
          );
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error desconocido";
          setMessage(`Error al crear la reserva: ${errorMessage}`);
          setReservationStatus("failed");
        } finally {
          // El setTimeout para la navegación sigue aquí
          const timer = setTimeout(() => {
            navigate("/myreservations");
          }, 5000);

          return () => clearTimeout(timer);
        }
      };

      createReservation();
    }
  }, [searchParams, user, navigate, reservationStatus]);

  return (
    <div className="container mx-auto p-4 text-center">
      <h1
        className="text-3xl font-bold mb-4"
        style={{
          color:
            reservationStatus === "success"
              ? "green"
              : reservationStatus === "failed"
              ? "red"
              : "orange",
        }}
      >
        {message}
      </h1>
      <button
        onClick={() => navigate("/myreservations")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Ir a Mis Reservas
      </button>
    </div>
  );
};

export default PaymentSuccessPage;
