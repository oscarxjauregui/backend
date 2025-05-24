import { Router } from "express";
import {
  calcularNominaPilotos,
  calcularNominaAzafatas,
} from "../controllers/nomina.controller.js";

const router = Router();

router.post("/nomina/pilotos", calcularNominaPilotos);
router.post("/nomina/azafatas", calcularNominaAzafatas);

export default router;
