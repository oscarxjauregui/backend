import axios from "axios";
import dotenv from "dotenv";
import Reservacion from "../models/reservacion.model.js"; 
import { sendEmail } from "../utils/sendEmail.js";
import vueloModel from "../models/vuelo.model.js"; 

dotenv.config();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API_BASE_URL = process.env.PAYPAL_API_BASE_URL;

const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      throw new Error(
        "Missing PAYPAL_CLIENT_ID or PAYPAL_SECRET environment variables."
      );
    }
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
      "base64"
    );
    const { data } = await axios.post(
      `${PAYPAL_API_BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return data.access_token;
  } catch (error) {
    console.error(
      "Failed to generate PayPal Access Token:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to generate PayPal Access Token.");
  }
};

export const createPayPalOrder = async (req, res) => {
  const { reservacionId, amount, currency = "USD" } = req.body; 

  if (!reservacionId || !amount) {
    return res
      .status(400)
      .json({ message: "Reservacion ID and amount are required." });
  }

  try {
    const accessToken = await generateAccessToken();
    const { data } = await axios.post(
      `${PAYPAL_API_BASE_URL}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2), 
            },
            custom_id: reservacionId,
            description: `Reserva de Vuelo #${reservacionId}`,
          },
        ],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/success-paypal?reservacionId=${reservacionId}`,
          cancel_url: `${process.env.FRONTEND_URL}/cancel-paypal?reservacionId=${reservacionId}`,
          brand_name: "Vuelazos XD",
          locale: "es-MX",
          landing_page: "NO_PREFERENCE",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reservacion = await Reservacion.findById(reservacionId);
    if (reservacion) {
      reservacion.paypalOrderId = data.id;
      await reservacion.save();
    } else {
      console.warn(
        `Reservación ${reservacionId} no encontrada al crear orden de PayPal.`
      );
    }

    res.status(201).json({ id: data.id }); 
  } catch (error) {
    console.error(
      "Failed to create PayPal order:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ message: "Failed to create PayPal order." });
  }
};

export const capturePayPalOrder = async (req, res) => {
  const { orderId, reservacionId } = req.body;

  if (!orderId || !reservacionId) {
    return res
      .status(400)
      .json({ message: "PayPal Order ID and Reservacion ID are required." });
  }

  try {
    const accessToken = await generateAccessToken();
    const { data } = await axios.post(
      `${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {}, 
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (data.status === "COMPLETED") {
      const paypalCaptureId = data.purchase_units[0].payments.captures[0].id;
      console.log(
        `PayPal Order ${orderId} CAPTURED. Capture ID: ${paypalCaptureId}`
      );

      const reservacion = await Reservacion.findById(reservacionId);
      if (reservacion) {
        reservacion.estado = "pagada";
        reservacion.paypalCaptureId = paypalCaptureId; 
        await reservacion.save();

        await sendPayPalReceiptEmail(reservacion, data);

        res.status(200).json({
          message: "Payment captured successfully.",
          captureId: paypalCaptureId,
        });
      } else {
        console.warn(
          `Reservación ${reservacionId} no encontrada al capturar pago de PayPal.`
        );
        res.status(404).json({ message: "Reservation not found." });
      }
    } else {
      console.error(`PayPal Order ${orderId} capture status: ${data.status}`);
      res
        .status(400)
        .json({ message: `PayPal payment not completed: ${data.status}` });
    }
  } catch (error) {
    console.error(
      "Failed to capture PayPal order:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ message: "Failed to capture PayPal order." });
  }
};

async function sendPayPalReceiptEmail(reservacion, paypalCaptureData) {
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

    const capture = paypalCaptureData.purchase_units[0].payments.captures[0];
    const amount = capture.amount.value;
    const currency = capture.amount.currency_code;
    const paypalTransactionId = capture.id;

    const subject = `¡Recibo de tu Vuelo con Vuelazos XD! - #${reservacion._id
      .toString()
      .substring(0, 8)}`;
    const textContent = `
Hola ${user.nombre || "estimado cliente"},

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
        <li><strong>Asientos Reservados:</strong> ${reservacion.asientos}</li>
        <li><strong>Estado:</strong> Pagada</li>
    </ul>
    <p><strong>Detalles del Pago PayPal:</strong></p>
    <ul>
        <li><strong>Monto Total:</strong> <strong>$${amount} ${currency}</strong></li>
        <li><strong>ID de Transacción PayPal:</strong> ${paypalTransactionId}</li>
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
