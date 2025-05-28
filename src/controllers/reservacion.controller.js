import mongoose from "mongoose";
import Reservacion from "../models/reservacion.model.js";
import vueloModel from "../models/vuelo.model.js";
import User from "../models/user.model.js";

export const _createReservationLogic = async (vueloId, userId, asientos) => {
  if (!userId) {
    throw new Error("No user ID provided. User must be authenticated.");
  }
  if (!mongoose.Types.ObjectId.isValid(vueloId)) {
    throw new Error("ID de vuelo inválido");
  }
  // Convertir a número entero y validar. Usamos Number() para asegurar el tipo.
  const numAsientos = Number(asientos);
  if (
    !numAsientos || // Verifica que no sea 0, NaN, null, undefined
    typeof numAsientos !== "number" ||
    numAsientos < 1 ||
    !Number.isInteger(numAsientos)
  ) {
    throw new Error(
      "Número de asientos inválido. Debe ser un número entero positivo."
    );
  }

  // --- BUSCA EL VUELO Y DECREMENTA ASIENTOS ---
  // Aquí es donde corregiremos el "quitar un lugar extra"
  // El $inc decrementa exactamente la cantidad de 'asientos'.
  // Si te quita uno extra, asegúrate que 'asientos' tenga el valor correcto (ej. 1, 2, 3...)
  const vueloActualizado = await vueloModel.findOneAndUpdate(
    {
      _id: vueloId,
      asientosDisponibles: { $gte: numAsientos }, // Asegura que haya suficientes asientos
    },
    {
      $inc: { asientosDisponibles: -numAsientos }, // Decrementa exactamente 'numAsientos'
    },
    { new: true } // Devuelve el documento actualizado
  );

  if (!vueloActualizado) {
    // Si findOneAndUpdate no encontró un vuelo que cumpliera las condiciones
    // (o no había suficientes asientos)
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
    estado: "confirmada", // Asumimos que esta lógica solo se llama para reservas confirmadas
    fechaReservacion: new Date(),
  });

  const reservacionGuardada = await nuevaReservacion.save();
  return reservacionGuardada;
};

export const createReservacion = async (req, res) => {
  try {
    const { vueloId } = req.params;
    const { asientos } = req.body; // Esto debería ser el número de asientos deseado
    const userId = req.user?.id;

    // Llama a la lógica central de reserva
    const reservacionGuardada = await _createReservationLogic(
      vueloId,
      userId,
      asientos
    );

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
    // Para errores de validación lanzados por _createReservationLogic
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

    // 1. Encuentra las reservaciones del usuario y popula el vuelo
    const reservacionesConVuelo = await Reservacion.find({ userId: userId })
      .populate("vueloId")
      .populate("userId"); // Opcional si no necesitas los detalles completos del usuario

    // 2. Filtra las reservaciones donde vueloId es null (es decir, el vuelo asociado fue eliminado)
    const reservacionesValidas = reservacionesConVuelo.filter(
      (reservacion) => reservacion.vueloId !== null
    );

    res.status(200).json(reservacionesValidas); // Envía solo las reservaciones válidas
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
      .populate("vueloId") // <-- ¡CAMBIO AQUÍ!
      .populate("userId"); // <-- ¡CAMBIO AQUÍ!
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
