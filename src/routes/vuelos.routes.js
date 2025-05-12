import { Router } from "express";
import {
  getVuelos,
  getVueloById,
  vueloUpload,
  updateHorarioVuelo,
  updateEstadoVuelo,
  getVuelosByDestino,
} from "../controllers/vuelo.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.get("/vuelos", getVuelos);

router.get("/vuelos/:id", getVueloById);

router.post("/vuelos", authRequired, vueloUpload);

router.put("/vuelos/:id/horario", authRequired, updateHorarioVuelo);

router.put("/vuelos/:id/estado", authRequired, updateEstadoVuelo);

router.get("/vuelos/destino/:destino", getVuelosByDestino);

export default router;
