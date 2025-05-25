import { Router } from "express";
import {
  getWeeklyReport,
  getMonthlyReport,
  getAnnualReport,
  getClientReservationsReport,
} from "../controllers/reportes.controller.js";

const router = Router();

router.get("/semanal", getWeeklyReport);
router.get("/mensual", getMonthlyReport);
router.get("/anual", getAnnualReport);
router.get("/clientes", getClientReservationsReport);

export default router;
