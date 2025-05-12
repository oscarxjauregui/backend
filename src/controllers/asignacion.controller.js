import mongoose from "mongoose";
import Asignacion from "../models/asignacion.model.js";
import Vuelo from "../models/vuelo.model.js";
import User from "../models/user.model.js";

export const createAsignacion = async (req, res) => {
  const { vueloId, capitanId, tripulacionId } = req.body;
  if (!vueloId) {
    return res.status(400).json({ message: "El vueloId es obligatorio" });
  }

  if (!mongoose.Types.ObjectId.isValid(vueloId)) {
    return res
      .status(400)
      .json({ message: "El ID del vuelo proporcionado no es válido." });
  }
  if (!mongoose.Types.ObjectId.isValid(capitanId)) {
    return res
      .status(400)
      .json({ message: "El ID del capitán proporcionado no es válido." });
  }

  let tripulacionValida = {};
  if (tripulacionId) {
    if (!Array.isArray(tripulacionId)) {
      return res.status(400).json({ message: "La tripulación es obligatoria" });
    }
    for (const userId of tripulacionId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          message: "El ID de la tripulación proporcionado no es válido.",
        });
      }
      tripulacionValida = tripulacionId;
    }
  }

  try {
    const asignacionExistente = await Asignacion.findOne({ vueloId: vueloId });
    if (asignacionExistente) {
      return res.status(400).json({
        message: "Ya existe una asignación para este vuelo.",
      });
    }
    const vueloDb = await Vuelo.findById(vueloId);
    if (!vueloDb) {
      return res.status(404).json({ message: "Vuelo no encontrado" });
    }
    const capitanDb = await User.findById(capitanId);
    if (!capitanDb) {
      return res.status(404).json({ message: "Capitán no encontrado" });
    }
    if (tripulacionValida.length > 0) {
      const personasEncontradas = await User.countDocuments({
        _id: { $in: tripulacionValida },
      });
      if (personasEncontradas !== tripulacionValida.length) {
        return res
          .status(404)
          .json({ message: "Una o mas personas no encontradas" });
      }
    }

    const nuevaAsignacion = new Asignacion({
      vueloId: vueloId,
      capitanId: capitanId,
      tripulacionId: tripulacionValida,
    });
    const asignacionGuardada = await nuevaAsignacion.save();
    res.status(201).json(asignacionGuardada);
  } catch (error) {
    console.error("Error al crear la asignacion:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: "Error interno del servidor al crear la asignacion.",
    });
  }
};

export const getAsignaciones = async (req, res) => {
  try {
    const asignaciones = await Asignacion.find({})
      .populate("vueloId", "origen destino fechaSalida fechaLlegada aerolinea")
      .populate("capitanId", "nombre apellido")
      .populate("tripulacionId", "nombre apellido");
    res.status(200).json(asignaciones);
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getAsignacionByVueloId = async (req, res) => {
  const { vueloId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(vueloId)) {
    return res
      .status(400)
      .json({ message: "El ID del vuelo proporcionado no es válido." });
  }
  try {
    const asignacion = await Asignacion.findOne({ vueloId: vueloId })
      .populate("vueloId", "origen destino fechaSalida fechaLlegada aerolinea")
      .populate("capitanId", "nombre apellido")
      .populate("tripulacionId", "nombre apellido");

    if (!asignacion) {
      return res.status(404).json({
        message: "No se encontró una asignación para el vuelo especificado.",
      });
    }
    res.json(asignacion);
  } catch (error) {
    console.error("Error al obtener asignación por ID de vuelo:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener la asignación." });
  }
};

export const deleteAsignacion = async (req, res) => {
  const { asignacionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(asignacionId)) {
    return res.status(400).json({ message: "ID de asignación inválido" });
  }
  try {
    const asignacionEliminada = await Asignacion.findByIdAndDelete(
      asignacionId
    );
    if (!asignacionEliminada) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }
    res.status(200).json({ message: "Asignación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
    res
      .status(500)
      .json({
        message: "Error interno del servidor al eliminar la asignación.",
      });
  }
};
