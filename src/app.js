import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import Stripe from "stripe";

import authRoutes from "./routes/auth.routes.js";
import vuelosRoutes from "./routes/vuelos.routes.js";
import reservacionRoutes from "./routes/reservacion.routes.js";
import userRoutes from "./routes/user.routes.js";
import asignacionRoutes from "./routes/asignacion.routes.js";
import nominaRoutes from "./routes/nomina.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

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


app.use("/api", authRoutes);

app.use("/api", vuelosRoutes);

app.use("/api", reservacionRoutes);

app.use("/api", userRoutes);

app.use("/api", asignacionRoutes);

app.use("/api", nominaRoutes);

app.use("/api/reportes", reportesRoutes);

app.use("/api", paymentRoutes);

export default app;
