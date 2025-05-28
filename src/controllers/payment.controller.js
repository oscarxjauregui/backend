import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createSession = async (req, res) => {
  const { name, description, unit_amount, quantity, vueloId, userId } =
    req.body;

  if (
    !name ||
    !description ||
    typeof unit_amount !== "number" ||
    !quantity ||
    quantity <= 0 ||
    !vueloId ||
    !userId
  ) {
    return res.status(400).json({
      message: "Faltan datos obligatorios para crear la sesión de pago.",
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            product_data: {
              name: name,
              description: description,
            },
            currency: "USD",
            unit_amount: unit_amount,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}&vueloId=${vueloId}&userId=${userId}&asientos=${quantity}`,
      cancel_url: "http://localhost:5173/cancel",
    });
    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor al crear la sesión de pago.",
      error: error.message,
    });
  }
};

export const handlePaymentSuccess = async (req, res) => {
  console.log("Usuario regresó a la página de éxito del pago.");
  res.status(200).send("Pago completado. Tu reserva está confirmada.");
};

export const handlePaymentCancel = (req, res) => {
  console.log("Pago cancelado por el usuario.");
  res.status(200).send("Pago cancelado.");
};
