import axios from "./axios";

export const createCheckoutSession = async (data) => {
  try {
    const res = await axios.post("/payment/create-checkout-session", data); 
    return res.data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};
