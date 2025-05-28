import { Router } from "express";
import {
  createReservacion,
  getReservaciones,
  cancelReservacion,
  getReservacionStatus,
  checkInReservacion,
  getReservationById,
} from "../controllers/reservacion.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.post("/reservaciones/:vueloId", authRequired, createReservacion);

router.get("/reservaciones", authRequired, getReservaciones);

router.delete("/reservaciones/:reservacionId", authRequired, cancelReservacion);

router.get("/reservaciones/:id", getReservationById);

router.get("/reservaciones/:id/status", authRequired, getReservacionStatus);

router.post("/reservaciones/:id/checkin", authRequired, checkInReservacion);

export default router;
