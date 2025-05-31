import Stripe from "stripe";
import dotenv from "dotenv";
import Reservacion from "../models/reservacion.model.js";
import User from "../models/user.model.js";
import vueloModel from "../models/vuelo.model.js";
import { sendEmail } from "../utils/sendEmail.js"; 
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Checkout Session Completed:", session.id);
      try {
        const reservacion = await Reservacion.findOne({
          stripeSessionId: session.id,
        });
        if (reservacion) {
          reservacion.estado = "pagada";
          reservacion.paymentIntentId = session.payment_intent;
          await reservacion.save();
          console.log(`Reservación ${reservacion._id} marcada como pagada.`);

          await sendReceiptEmail(reservacion, session);
        } else {
          console.warn(
            `Reservación no encontrada para la sesión de Stripe: ${session.id}`
          );
        }
      } catch (dbError) {
        console.error(
          "Error al actualizar la reservación después del webhook:",
          dbError
        );
      }
      break;
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("Payment Intent Succeeded:", paymentIntent.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.status(200).json({ received: true });
};

async function sendReceiptEmail(reservacion, stripeSession) {
  try {
    const user = await User.findById(reservacion.userId).select(
      "email nombre apellido"
    );
    const vuelo = await vueloModel.findById(reservacion.vueloId);

    if (!user || !user.email || !vuelo) {
      console.warn(
        `No se pudo enviar recibo: faltan datos de usuario o vuelo para reservación ${reservacion._id}`
      );
      return;
    }

    const receiptUrl =
      stripeSession.receipt_url ||
      `https://dashboard.stripe.com/test/payments/${stripeSession.payment_intent}`; 

    const subject = `¡Recibo de tu Vuelo con Vuelazos XD! - #${reservacion._id
      .toString()
      .substring(0, 8)}`;
    const textContent = `Hola ${user.nombre || "estimado cliente"},

¡Gracias por tu pago! Aquí está la confirmación de tu reserva y tu recibo.

Detalles de la Reserva:
Número de Reserva: ${reservacion._id}
Vuelo: ${vuelo.numeroVuelo}
Origen: ${vuelo.origen}
Destino: ${vuelo.destino}
Fecha de Vuelo: ${new Date(vuelo.fechaVuelo).toLocaleDateString()}
Asientos Reservados: ${reservacion.asientos}
Estado: Pagada

Monto Total: $${(stripeSession.amount_total / 100).toFixed(
      2
    )} USD (o la moneda de tu Stripe Session)
ID de Transacción Stripe: ${stripeSession.payment_intent || stripeSession.id}
Puedes ver tu recibo completo aquí: ${receiptUrl}

¡Esperamos verte pronto!

Atentamente,
El equipo de Vuelazos XD
`.trim();
    const htmlContent = `
    <p>Hola <strong>${user.nombre || "estimado cliente"}</strong>,</p>
    <p>¡Gracias por tu pago! Aquí está la confirmación de tu reserva y tu recibo.</p>
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
        <li><strong>Asientos Reservados:</strong> <span class="math-inline">\{reservacion\.asientos\}</li\>
<li><strong>Estado:</strong> Pagada</li>
</ul>
<p><strong>Detalles del Pago:</strong></p>
<ul>
<li><strong>Monto Total:</strong> <strong>${(
      stripeSession.amount_total / 100
    ).toFixed(2)} USD</strong> (o la moneda de tu Stripe Session)</li>
<li><strong>ID de Transacción Stripe:</strong> stripeSession.payment 
i
​
 ntent∣∣stripeSession.id</li><li><ahref="{receiptUrl}" target="_blank">Ver Recibo Completo en Stripe</a></li>
</ul>
<p>¡Esperamos verte pronto!</p>
<p>Atentamente,<br/>El equipo de Vuelazos XD</p>
`;

    await sendEmail(user.email, subject, textContent, htmlContent);
  } catch (error) {
    console.error(
      `Error al preparar/enviar recibo para reservación ${reservacion._id}:`,
      error
    );
  }
}
