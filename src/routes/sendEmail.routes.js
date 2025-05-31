import { Router } from "express";
import { enviarMail } from "../controllers/sendEmail.controller.js"; 

const router = Router();

router.post("/sendEmail", enviarMail);

export default router;
