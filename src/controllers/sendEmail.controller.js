// backend/src/controllers/sendEmail.controller.js
import { sendEmail } from "../utils/sendEmail.js"; // Importa la utilidad

// Controlador para la ruta API de envío de correos (para pruebas con JSON)
export const enviarMail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        message:
          "Faltan datos obligatorios para enviar el correo (to, subject, y al menos text o html).",
      });
    }

    // Llama a la función de utilidad para enviar el correo
    const result = await sendEmail(to, subject, text, html);

    if (result.success) {
      res.status(200).json({
        message: "Correo enviado exitosamente",
        messageId: result.messageId,
        previewURL: result.previewURL,
      });
    } else {
      res.status(500).json({
        message: "Error interno del servidor al enviar el correo",
        error: result.error,
        details: result.details,
      });
    }
  } catch (error) {
    console.error("Error inesperado en el controlador sendEmail:", error);
    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};
