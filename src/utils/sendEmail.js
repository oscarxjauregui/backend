import nodemailer from "nodemailer";
import dotenv from "dotenv"; 

dotenv.config();

export const sendEmail = async (to, subject, text, html = '') => {
  try {
    const config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
 
    };

    const transporter = nodemailer.createTransport(config);

    const mensaje = {
      from: `Vuelazos XD <${process.env.SMTP_USER}>`, 
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