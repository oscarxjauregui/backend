import { Router } from "express";
import {
  createAsignacion,
  getAsignaciones,
  getAsignacionByVueloId,
  deleteAsignacion,
} from "../controllers/asignacion.controller.js";

import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.post("/asignaciones", authRequired, createAsignacion);

router.get("/asignaciones", authRequired, getAsignaciones);

router.get("/asignaciones/:vueloId", authRequired, getAsignacionByVueloId);

router.delete("/asignaciones/:asignacionId", authRequired, deleteAsignacion);

export default router;
