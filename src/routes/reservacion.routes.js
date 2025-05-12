import { Router } from "express";
import {
  createReservacion,
  getReservaciones,
  cancelReservacion,
} from "../controllers/reservacion.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.post("/reservaciones/:vueloId", authRequired, createReservacion);

router.get("/reservaciones", authRequired, getReservaciones);

router.delete("/reservaciones/:reservacionId", authRequired, cancelReservacion);

export default router;
