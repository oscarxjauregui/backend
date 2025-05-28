// src/api/payment.js
import axios from "./axios"; // <-- Asegúrate de importar la instancia configurada

export const createCheckoutSession = async (data) => {
  try {
    const res = await axios.post("/payment/create-checkout-session", data); // El '/payment' se añade a la baseURL
    return res.data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};
