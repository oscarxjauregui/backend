import mongoose from "mongoose";
import Reservacion from "../models/reservacion.model.js";
import vueloModel from "../models/vuelo.model.js"; // Asegúrate de importar el modelo de vuelo con un nombre consistente, por ejemplo, vueloModel

// Función para crear una nueva reservación
export const createReservacion = async (req, res) => {
  try {
    const { vueloId } = req.params;
    const { asientos } = req.body;
    const userId = req.user?.id; 

    if (!userId) {
      return res
        .status(401)
        .json({
          message:
            "No tienes permiso para realizar esta acción. Inicia sesión.",
        });
    }
    if (!mongoose.Types.ObjectId.isValid(vueloId)) {
      return res.status(400).json({ message: "ID de vuelo inválido" });
    }
    if (
      !asientos ||
      typeof asientos !== "number" ||
      asientos < 1 ||
      !Number.isInteger(asientos)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Número de asientos inválido. Debe ser un número entero positivo.",
        });
    }

    // Intentar encontrar el vuelo y decrementar asientos disponibles en una sola operación atómica
    // Usamos vueloModel, no solo 'vuelo'
    const vueloActualizado = await vueloModel.findOneAndUpdate(
      {
        _id: vueloId,
        asientosDisponibles: { $gte: asientos }, // Verifica que haya suficientes asientos
      },
      {
        $inc: { asientosDisponibles: -asientos }, // Decrementa los asientos disponibles
      },
      { new: true } // Devuelve el documento actualizado
    );

    if (!vueloActualizado) {
      // Si findOneAndUpdate no encontró o no pudo actualizar (no había suficientes asientos)
      // Verificamos si el vuelo existe para dar un mensaje más específico
      // Usamos vueloModel, no 'Vuelo'
      const vueloExiste = await vueloModel
        .findById(vueloId)
        .select("_id asientosDisponibles");

      if (!vueloExiste) {
        return res.status(404).json({ message: "Vuelo no encontrado" });
      } else {
        return res
          .status(400)
          .json({
            message: "No hay suficientes asientos disponibles en este vuelo.",
          });
      }
    }

    // Si se pudo actualizar el vuelo, crear la reservación
    const nuevaReservacion = new Reservacion({
      userId: userId,
      vueloId: vueloId, // Guardamos la referencia al vuelo
      asientos: asientos,
    });

    const reservacionGuardada = await nuevaReservacion.save();

    res.status(201).json({
      message: "Reservación creada exitosamente",
      reservacion: reservacionGuardada,
    });
  } catch (error) {
    console.error("Error al crear la reservación:", error);
    // Verificar si es un error de duplicado u otro tipo de error conocido
    if (error.code === 11000) {
      // Código de error de duplicado de MongoDB
      return res
        .status(400)
        .json({
          message:
            "Error al crear la reservación: Datos duplicados (ej. si intentas reservar el mismo vuelo con el mismo usuario de forma concurrente y hay una restricción única).",
        });
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear la reservación" });
  }
};

// Función para obtener todas las reservaciones de un usuario
export const getReservaciones = async (req, res) => {
  try {
    const userId = req.user?.id; // Obtener el ID del usuario autenticado

    if (!userId) {
      return res
        .status(401)
        .json({
          message: "No tienes permiso para ver reservaciones. Inicia sesión.",
        });
    }

    // Buscar todas las reservaciones que pertenecen a este usuario
    // .populate('vueloId') cargará los detalles completos del vuelo asociado en cada reservación
    const reservaciones = await Reservacion.find({ userId: userId })
      .populate("vueloId") // Esto asume que 'vueloId' es un ObjectId que referencia tu modelo de Vuelo
      .sort({ createdAt: -1 }); // Opcional: ordenar por fecha de creación descendente

    // Si no encuentra reservaciones, devuelve un array vacío, lo cual es un resultado válido
    res.status(200).json(reservaciones);
  } catch (error) {
    console.error("Error al obtener las reservaciones:", error);
    res
      .status(500)
      .json({
        message: "Error interno del servidor al obtener las reservaciones",
      });
  }
};

export const cancelReservacion = async (req, res) => {
  try {
    const { reservacionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({
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
      return res
        .status(404)
        .json({
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
    res
      .status(500)
      .json({
        message: "Error interno del servidor al cancelar la reservación",
      });
  }
};
