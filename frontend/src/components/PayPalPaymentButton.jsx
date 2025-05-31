import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { createReservacionRequest } from "../api/reservaciones";

const PayPalPaymentButton = ({
  totalAmount,
  vueloDetails,
  formData,
  userId,
  onPaymentSuccess,
  onPaymentError,
  onPaymentProcessing,
}) => {
  const paypalRef = useRef();

  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    if (window.paypal && paypalRef.current) {
      if (totalAmount <= 0) {
        console.warn(
          "Total amount is 0 or less, PayPal button will not be rendered."
        );
        return;
      }

      paypalRef.current.innerHTML = "";

      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          },
          createOrder: (data, actions) => {
            onPaymentProcessing(true);
            setPaymentError(null);
            return actions.order.create({
              purchase_units: [
                {
                  description: `Reserva de Vuelo (${vueloDetails.origen} a ${vueloDetails.destino})`,
                  amount: {
                    currency_code: "MXN",
                    value: totalAmount.toFixed(2),
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            try {
              const order = await actions.order.capture();
              console.log("PayPal Order Captured:", order);

              const reservationData = {
                asientos: formData.asientos,
                costoTotal: totalAmount,
                estadoPago: "pagado",
                metodoPago: "PayPal",
                paypalOrderId: order.id,
              };

              const newReservation = await createReservacionRequest(
                vueloDetails._id,
                reservationData
              );
              console.log("Reservation created (PayPal):", newReservation);

              onPaymentProcessing(false);
              onPaymentSuccess(newReservation);
            } catch (err) {
              console.error(
                "Error capturing PayPal payment or creating reservation:",
                err
              );
              onPaymentProcessing(false);
              const errorMessage =
                err.message ||
                "Error al procesar el pago o crear la reserva. Por favor, inténtalo de nuevo.";
              setPaymentError(errorMessage);
              onPaymentError(errorMessage);
            }
          },
          onError: (err) => {
            console.error("PayPal button error:", err);
            onPaymentProcessing(false);
            const errorMessage = "Error al iniciar la transacción con PayPal.";
            setPaymentError(errorMessage);
            onPaymentError(errorMessage);
          },
          onCancel: () => {
            console.log("PayPal payment cancelled.");
            onPaymentProcessing(false);
            const errorMessage = "Pago con PayPal cancelado.";
            setPaymentError(errorMessage);
            onPaymentError(errorMessage);
          },
        })
        .render(paypalRef.current);
    } else {
      console.log("PayPal SDK not yet ready in PayPalPaymentButton.");
    }
  }, [
    totalAmount,
    vueloDetails,
    formData,
    userId,
    onPaymentSuccess,
    onPaymentError,
    onPaymentProcessing,
  ]);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-3">Pagar con PayPal</h3>
      {!window.paypal && (
        <p className="text-gray-600">Cargando botón de PayPal...</p>
      )}
      {paymentError && (
        <p className="text-red-600 font-medium text-center mb-4">
          {paymentError}
        </p>
      )}
      <div ref={paypalRef} className="max-w-xs mx-auto"></div>
      <p className="text-sm text-gray-500 text-center mt-2">
        Serás redirigido a PayPal para completar tu compra.
      </p>
    </div>
  );
};

PayPalPaymentButton.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  vueloDetails: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
  userId: PropTypes.string,
  onPaymentSuccess: PropTypes.func.isRequired,
  onPaymentError: PropTypes.func.isRequired,
  onPaymentProcessing: PropTypes.func.isRequired,
};

export default PayPalPaymentButton;
