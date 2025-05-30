// backend/src/utils/emailSender.js
import nodemailer from "nodemailer";
import dotenv from "dotenv"; // Asegúrate de importar dotenv aquí también para esta utilidad

dotenv.config(); // Carga las variables de entorno para esta utilidad

// Función genérica para enviar correos
export const sendEmail = async (to, subject, text, html = '') => {
  try {
    const config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT === '465', // true para 465 (SSL/TLS), false para otros (STARTTLS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Descomenta esto solo si tienes problemas de certificado SSL en desarrollo (NO USAR EN PRODUCCIÓN)
      // tls: {
      //   rejectUnauthorized: false
      // }
    };

    const transporter = nodemailer.createTransport(config);

    const mensaje = {
      from: `Vuelazos XD <${process.env.SMTP_USER}>`, // Remitente visible
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mensaje);

    console.log("Correo enviado exitosamente. ID del mensaje:", info.messageId);
    console.log("Respuesta del servidor SMTP:", info.response);
    return { success: true, messageId: info.messageId, previewURL: nodemailer.getTestMessageUrl(info) };

  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return { success: false, error: error.message, details: error };
  }
};