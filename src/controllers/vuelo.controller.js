import Vuelo from "../models/vuelo.model.js";
import mongoose from "mongoose";

// Obtener todos los vuelos
export const getVuelos = async (req, res) => {
  try {
    const vuelos = await Vuelo.find({});
    res.json(vuelos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un vuelo por su ID
export const getVueloById = async (req, res) => {
  try {
    const vuelo = await Vuelo.findById(req.params.id);
    if (!vuelo) return res.status(404).json({ message: "Vuelo no encontrado" });
    res.json(vuelo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVuelosByDestino = async (req, res) => {
  try {
    const { destino } = req.params;
    if (!destino) {
      return res.status(400).json({ message: "Destino no especificado" });
    }
    const vuelos = await Vuelo.find({
      destino: { $regex: new RegExp(`^${destino}$`, "i") },
    });

    if (vuelos.length === 0) {
      return res
        .status(404)
        .json({
          message: "No se encontraron vuelos para el destino especificado",
        });
    }
    res.json(vuelos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo vuelo
export const vueloUpload = async (req, res) => {
  const {
    origen,
    destino,
    fechaSalida,
    fechaLlegada,
    costo,
    asientosDisponibles,
    avion,
    aerolinea,
    estado,
  } = req.body;

  try {
    // Validar que todos los campos requeridos estén presentes
    if (
      !origen ||
      !destino ||
      !fechaSalida ||
      !fechaLlegada ||
      costo === undefined ||
      asientosDisponibles === undefined ||
      !avion ||
      !aerolinea ||
      !estado
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // Crear un nuevo vuelo
    const nuevoVuelo = new Vuelo({
      origen,
      destino,
      fechaSalida,
      fechaLlegada,
      costo,
      asientosDisponibles,
      avion,
      aerolinea,
      estado,
    });

    // Guardar el vuelo en la base de datos
    const vueloGuardado = await nuevoVuelo.save();

    // Responder con el vuelo creado
    res.status(201).json(vueloGuardado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHorarioVuelo = async (req, res) => {
  const { id } = req.params;
  const { fechaSalida, fechaLlegada } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de vuelo inválido" });
  }

  if (
    (fechaSalida === undefined && fechaLlegada === undefined) ||
    (fechaSalida !== undefined && isNaN(new Date(fechaSalida).getTime())) ||
    (fechaLlegada !== undefined && isNaN(new Date(fechaLlegada).getTime()))
  ) {
    return res.status(400).json({ message: "Fechas no válidas" });
  }
  try {
    const updatedVuelo = {};
    if (fechaSalida !== undefined)
      updatedVuelo.fechaSalida = new Date(fechaSalida);
    if (fechaLlegada !== undefined)
      updatedVuelo.fechaLlegada = new Date(fechaLlegada);

    const vueloActualizado = await Vuelo.findByIdAndUpdate(id, updatedVuelo, {
      new: true,
    });

    if (!vueloActualizado) {
      return res.status(404).json({ message: "Vuelo no encontrado" });
    }
    res.status(200).json(vueloActualizado);
  } catch (error) {
    console.error(`Error al actualizar horario de vuelo ${id}:`, error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({
      message: "Error interno del servidor al actualizar horario del vuelo.",
    });
  }
};

export const updateEstadoVuelo = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de vuelo inválido" });
  }

  if (!estado) {
    return res.status(400).json({ message: "Estado no especificado" });
  }

  try {
    const vueloActualizado = await Vuelo.findByIdAndUpdate(
      id,
      { estado: estado },
      { new: true }
    );
    if (!vueloActualizado) {
      return res.status(404).json({ message: "Vuelo no encontrado." });
    }
    res.status(200).json(vueloActualizado);
  } catch (error) {
    console.error(`Error al actualizar estado de vuelo ${id}:`, error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({
      message: "Error interno del servidor al actualizar estado del vuelo.",
    });
  }
};
