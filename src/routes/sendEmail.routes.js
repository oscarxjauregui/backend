// backend/src/routes/sendEmail.routes.js
import { Router } from "express";
import { enviarMail } from "../controllers/sendEmail.controller.js"; // Importa la función 'enviarMail' como un named export

const router = Router();

router.post("/sendEmail", enviarMail);

export default router;
