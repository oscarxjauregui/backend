import { Router } from "express";

import {
  createSession,
  handlePaymentSuccess,
  handlePaymentCancel,
} from "../controllers/payment.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.post("/payment/create-checkout-session", authRequired, createSession); 
router.get("/payment/success", handlePaymentSuccess);
router.get("/payment/cancel", handlePaymentCancel);

export default router;
