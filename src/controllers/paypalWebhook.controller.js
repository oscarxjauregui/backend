import Stripe from "stripe"; 
import dotenv from "dotenv";
import axios from "axios"; 
import Reservacion from "../models/reservacion.model.js";
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config();

const PAYPAL_API_BASE_URL = process.env.PAYPAL_API_BASE_URL;

export const handlePayPalWebhook = async (req, res) => {
  const transmissionId = req.headers["paypal-transmission-id"];
  const timeStamp = req.headers["paypal-transmission-time"];
  const crc32 = req.headers["paypal-transmission-sig"]; 
  const certUrl = req.headers["paypal-cert-url"]; 
  const authAlgo = req.headers["paypal-auth-algo"];

  const webhookId = process.env.PAYPAL_WEBHOOK_ID; 

  if (!webhookId) {
    console.error(
      "PAYPAL_WEBHOOK_ID is not configured in .env. Cannot verify webhook."
    );
    return res.status(400).send("Webhook ID missing.");
  }

  try {

    const verifyPayload = {
      webhook_id: webhookId,
      transmission_id: transmissionId,
      timestamp: timeStamp,
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_sig: crc32, 
      webhook_event: req.body,
    };

    const { data: verificationResult } = await axios.post(
      `${PAYPAL_API_BASE_URL}/v1/notifications/verify-webhook-signature`,
      verifyPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await generateAccessToken()}`,
        },
      }
    );

    if (verificationResult.verification_status !== "SUCCESS") {
      console.error("Webhook verification failed:", verificationResult);
      return res.status(400).send("Webhook verification failed.");
    }
    console.log("PayPal Webhook verified successfully.");

    // 2. Manejar el evento
    const event = req.body;
    switch (event.event_type) {
      case "CHECKOUT.ORDER.APPROVED":
        const orderIdApproved = event.resource.id;
        const customIdApproved = event.resource.purchase_units[0].custom_id; 

        console.log(
          `PayPal Order Approved: ${orderIdApproved} (Custom ID: ${customIdApproved})`
        );
        break;

      case "PAYMENT.CAPTURE.COMPLETED":
        const capture = event.resource;
        const orderIdCaptured =
          capture.supplementary_data.related_resources[0].order.id;
        const customIdCaptured =
          capture.custom_id || event.resource.purchase_units?.[0]?.custom_id;
        const paypalCaptureId = capture.id;

        console.log(
          `PayPal Payment Captured: ${paypalCaptureId} for Order: ${orderIdCaptured} (Custom ID: ${customIdCaptured})`
        );

        try {
          const reservacion = await Reservacion.findOne({
            $or: [
              { paypalOrderId: orderIdCaptured },
              { _id: customIdCaptured },
            ],
          });

          if (reservacion) {
            if (reservacion.estado !== "pagada") {
              reservacion.estado = "pagada";
              reservacion.paypalCaptureId = paypalCaptureId;
              await reservacion.save();
              console.log(
                `Reservación ${reservacion._id} marcada como pagada por webhook PayPal.`
              );

              await sendPayPalReceiptEmail(reservacion, event.resource); 
            } else {
              console.log(
                `Reservación ${reservacion._id} ya estaba marcada como pagada. Webhook duplicado.`
              );
            }
          } else {
            console.warn(
              `Reservación no encontrada para la captura de PayPal: ${orderIdCaptured}`
            );
          }
        } catch (dbError) {
          console.error(
            "Error al actualizar la reservación después del webhook de captura:",
            dbError
          );
        }
        break;

      case "PAYMENT.CAPTURE.DENIED":
        console.warn("PayPal Payment Capture DENIED:", event.resource.id);
        break;

      default:
        console.log(`Unhandled PayPal webhook event type: ${event.event_type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(
      "Error processing PayPal webhook:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error processing webhook.");
  }
};

async function sendPayPalReceiptEmail(reservacion, paypalEventResource) {
  try {
    const user = await User.findById(reservacion.userId).select(
      "email nombre apellido"
    );
    const vuelo = await vueloModel.findById(reservacion.vueloId);

    if (!user || !user.email || !vuelo) {
      console.warn(
        `No se pudo enviar recibo PayPal: faltan datos de usuario o vuelo para reservación ${reservacion._id}`
      );
      return;
    }

    const capture = paypalEventResource;
    const amount = capture.amount?.value || "N/A";
    const currency = capture.amount?.currency_code || "N/A";
    const paypalTransactionId = capture.id || "N/A";
    const orderId =
      capture.supplementary_data?.related_resources?.[0]?.order?.id || "N/A";

    const subject = `¡Recibo de tu Vuelo con Vuelazos XD! - #${reservacion._id
      .toString()
      .substring(0, 8)}`;
    const textContent = `Hola ${user.nombre || "estimado cliente"},

¡Gracias por tu pago con PayPal! Aquí está la confirmación de tu reserva y tu recibo.

Detalles de la Reserva:
Número de Reserva: ${reservacion._id}
Vuelo: ${vuelo.numeroVuelo}
Origen: ${vuelo.origen}
Destino: ${vuelo.destino}
Fecha de Vuelo: ${new Date(vuelo.fechaVuelo).toLocaleDateString()}
Asientos Reservados: ${reservacion.asientos}
Estado: Pagada

Monto Total: $${amount} ${currency}
ID de Transacción PayPal: ${paypalTransactionId}
ID de Orden PayPal: ${orderId}

¡Esperamos verte pronto!

Atentamente,
El equipo de Vuelazos XD
`.trim();
    const htmlContent = `
        <p>Hola <strong>${user.nombre || "estimado cliente"}</strong>,</p>
        <p>¡Gracias por tu pago con PayPal! Aquí está la confirmación de tu reserva y tu recibo.</p>
        <p><strong>Detalles de la Reserva:</strong></p>
        <ul>
            <li><strong>Número de Reserva:</strong> ${reservacion._id}</li>
            <li><strong>Vuelo:</strong> ${vuelo.numeroVuelo}</li>
            <li><strong>Origen:</strong> ${vuelo.origen}</li>
            <li><strong>Destino:</strong> ${vuelo.destino}</li>
            <li><strong>Fecha de Vuelo:</strong> ${new Date(
              vuelo.fechaVuelo
            ).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</li>
            <li><strong>Asientos Reservados:</strong> ${
              reservacion.asientos
            }</li>
            <li><strong>Estado:</strong> Pagada</li>
        </ul>
        <p><strong>Detalles del Pago PayPal:</strong></p>
        <ul>
            <li><strong>Monto Total:</strong> <strong>$${amount} ${currency}</strong></li>
            <li><strong>ID de Transacción PayPal:</strong> ${paypalTransactionId}</li>
            <li><strong>ID de Orden PayPal:</strong> ${orderId}</li>
        </ul>
        <p>¡Esperamos verte pronto!</p>
        <p>Atentamente,<br/>El equipo de Vuelazos XD</p>
        `;

    await sendEmail(user.email, subject, textContent, htmlContent);
  } catch (error) {
    console.error(
      `Error al preparar/enviar recibo PayPal para reservación ${reservacion._id}:`,
      error
    );
  }
}
