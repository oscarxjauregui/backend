import mongoose from "mongoose";
import Reservacion from "../models/reservacion.model.js";
import vueloModel from "../models/vuelo.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export const _createReservationLogic = async (vueloId, userId, asientos) => {
  if (!userId) {
    throw new Error("No user ID provided. User must be authenticated.");
  }
  if (!mongoose.Types.ObjectId.isValid(vueloId)) {
    throw new Error("ID de vuelo inválido");
  }
  const numAsientos = Number(asientos);
  if (
    !numAsientos || 
    typeof numAsientos !== "number" ||
    numAsientos < 1 ||
    !Number.isInteger(numAsientos)
  ) {
    throw new Error(
      "Número de asientos inválido. Debe ser un número entero positivo."
    );
  }

  const vueloActualizado = await vueloModel.findOneAndUpdate(
    {
      _id: vueloId,
      asientosDisponibles: { $gte: numAsientos }, 
    },
    {
      $inc: { asientosDisponibles: -numAsientos }, 
    },
    { new: true } 
  );

  if (!vueloActualizado) {

    const vueloExiste = await vueloModel
      .findById(vueloId)
      .select("_id asientosDisponibles");

    if (!vueloExiste) {
      throw new Error("Vuelo no encontrado");
    } else {
      throw new Error(
        `No hay suficientes asientos disponibles en este vuelo. Asientos disponibles: ${vueloExiste.asientosDisponibles}. Intentaste reservar: ${numAsientos}.`
      );
    }
  }

  const nuevaReservacion = new Reservacion({
    userId: userId,
    vueloId: vueloId,
    asientos: asientos,
    estado: "confirmada",
    fechaReservacion: new Date(),
  });

  const reservacionGuardada = await nuevaReservacion.save();
  return reservacionGuardada;
};

export const createReservacion = async (req, res) => {
  try {
    const { vueloId } = req.params;
    const { asientos } = req.body;
    const userId = req.user?.id;

    const reservacionGuardada = await _createReservationLogic(
      vueloId,
      userId,
      asientos
    );

    //email
    try {
      const user = await User.findById(userId).select("email nombre apellido"); 
      if (!user || !user.email) {
        console.warn(
          `Advertencia: No se pudo encontrar el email para el usuario ${userId}. No se enviará correo de confirmación.`
        );
      } else {
        const vuelo = await vueloModel.findById(vueloId);
        if (!vuelo) {
          console.warn(
            `Advertencia: Vuelo ${vueloId} no encontrado para la confirmación de correo.`
          );
        }

        const toEmail = user.email;
        const subject = `Confirmación de tu reserva de vuelo con Vuelazos XD - #${reservacionGuardada._id
          .toString()
          .substring(0, 8)}`; 

        const textContent = `
Hola ${user.nombre || "estimado cliente"},

¡Tu reserva ha sido confirmada exitosamente!

Detalles de la Reserva:
Número de Reserva: ${reservacionGuardada._id}
Vuelo: ${vuelo ? vuelo.numeroVuelo : "N/A"}
Origen: ${vuelo ? vuelo.origen : "N/A"}
Destino: ${vuelo ? vuelo.destino : "N/A"}
Fecha de Vuelo: ${
          vuelo ? new Date(vuelo.fechaVuelo).toLocaleDateString() : "N/A"
        }
Asientos Reservados: ${reservacionGuardada.asientos}
Estado: Confirmada

¡Gracias por volar con Vuelazos XD!

Atentamente,
El equipo de Vuelazos XD
        `.trim(); 

        const htmlContent = `
        <p>Hola <strong>${user.nombre || "estimado cliente"}</strong>,</p>
        <p>¡Tu reserva ha sido confirmada exitosamente!</p>
        <p><strong>Detalles de la Reserva:</strong></p>
        <ul>
            <li><strong>Número de Reserva:</strong> ${
              reservacionGuardada._id
            }</li>
            <li><strong>Origen:</strong> ${vuelo ? vuelo.origen : "N/A"}</li>
            <li><strong>Destino:</strong> ${vuelo ? vuelo.destino : "N/A"}</li>
            <li><strong>Fecha de Vuelo:</strong> ${
              vuelo
                ? new Date(vuelo.fechaSalida).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"
            }</li>
            <li><strong>Asientos Reservados:</strong> ${
              reservacionGuardada.asientos
            }</li>
            <li><strong>Estado:</strong> Confirmada</li>
        </ul>
        <p>¡Gracias por volar con <strong>Vuelazos XD</strong>!</p>
        <p>Atentamente,<br/>El equipo de Vuelazos XD</p>
        `;

        const emailResult = await sendEmail(
          toEmail,
          subject,
          textContent,
          htmlContent
        );

        if (emailResult.success) {
          console.log(
            `Correo de confirmación enviado a ${toEmail} (ID: ${emailResult.messageId})`
          );
        } else {
          console.error(
            `Fallo al enviar correo de confirmación a ${toEmail}: ${emailResult.error}`
          );
        }
      }
    } catch (emailError) {
      console.error(
        "Error inesperado en la lógica de envío de correo de confirmación:",
        emailError
      );
    }

    res.status(201).json({
      message: "Reservación creada exitosamente",
      reservacion: reservacionGuardada,
    });
  } catch (error) {
    console.error("Error al crear la reservación:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Error al crear la reservación: Datos duplicados (esto no debería ocurrir si no hay restricciones únicas en la combinación userId+vueloId, pero puede ser por stripeSessionId si el webhook se reintenta y no se maneja bien).",
      });
    }
    if (
      error.message.includes("ID de vuelo inválido") ||
      error.message.includes("Número de asientos inválido") ||
      error.message.includes("No user ID provided") ||
      error.message.includes("Vuelo no encontrado") ||
      error.message.includes("No hay suficientes asientos disponibles")
    ) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear la reservación" });
  }
};

export const getReservaciones = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "No tienes permiso para ver reservaciones. Inicia sesión.",
      });
    }

    const reservacionesConVuelo = await Reservacion.find({ userId: userId })
      .populate("vueloId")
      .populate("userId");

    const reservacionesValidas = reservacionesConVuelo.filter(
      (reservacion) => reservacion.vueloId !== null
    );

    res.status(200).json(reservacionesValidas);
  } catch (error) {
    console.error("Error al obtener las reservaciones:", error);
    res.status(500).json({
      message: "Error interno del servidor al obtener las reservaciones",
    });
  }
};

export const cancelReservacion = async (req, res) => {
  try {
    const { reservacionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message:
          "No tienes permiso para cancelar reservaciones. Inicia sesión.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(reservacionId)) {
      return res.status(400).json({ message: "ID de reservación inválido" });
    }

    const reservacionEliminada = await Reservacion.findOneAndDelete({
      _id: reservacionId,
      userId: userId,
    });

    if (!reservacionEliminada) {
      return res.status(404).json({
        message:
          "Reservación no encontrada o no tienes permiso para cancelarla.",
      });
    }

    const vueloActualizado = await vueloModel.findByIdAndUpdate(
      reservacionEliminada.vueloId,
      { $inc: { asientosDisponibles: reservacionEliminada.asientos } },
      { new: true }
    );

    if (!vueloActualizado) {
      console.warn(
        `Advertencia: Reservación ${reservacionId} cancelada para el usuario ${userId}, pero falló la actualización de asientos para el vuelo ${reservacionEliminada.vueloId}.`
      );
    }

    res.status(200).json({
      message: "Reservación cancelada exitosamente",
      reservacion: reservacionEliminada,
    });
  } catch (error) {
    console.error("Error al cancelar la reservación:", error);
    res.status(500).json({
      message: "Error interno del servidor al cancelar la reservación",
    });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservacion = await Reservacion.findById(id)
      .populate("vueloId") 
      .populate("userId"); 
    if (!reservacion) {
      return res.status(404).json({ message: "Reservación no encontrada." });
    }
    res.json(reservacion);
  } catch (error) {
    console.error("Error en getReservationById del controlador:", error);
    return res.status(500).json({
      message: "Error al obtener la reservación por ID: " + error.message,
    });
  }
};
