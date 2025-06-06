import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import vuelosRoutes from "./routes/vuelos.routes.js";
import reservacionRoutes from "./routes/reservacion.routes.js";
import userRoutes from "./routes/user.routes.js";
import asignacionRoutes from "./routes/asignacion.routes.js";
import nominaRoutes from "./routes/nomina.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import sendEmailRoutes from "./routes/sendEmail.routes.js";
import paypalRoutes from "./routes/paypal.routes.js";
import { handleStripeWebhook } from "./controllers/webhook.controller.js"; 
import { handlePayPalWebhook } from "./controllers/paypalWebhook.controller.js"; 

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.post("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api", authRoutes);

app.use("/api", vuelosRoutes);

app.use("/api", reservacionRoutes);

app.use("/api", userRoutes);

app.use("/api", asignacionRoutes);

app.use("/api", nominaRoutes);

app.use("/api/reportes", reportesRoutes);

app.use("/api", paymentRoutes);

app.use("/api", sendEmailRoutes);

app.use("/api", paypalRoutes);

app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.post(
  "/api/paypal/webhook",
  express.raw({ type: "application/json" }),
  handlePayPalWebhook
);

export default app;
