// src/models/reservacion.model.js
import mongoose from "mongoose";

const reservacionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vueloId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vuelo",
      required: true,
    },
    asientos: {
      type: Number,
      required: true,
      min: 1,
    },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada", "reembolsada"],
      default: "confirmada",
    },
    fechaReservacion: {
      type: Date,
      default: Date.now,
    },
    pasajeros: [
      {
        nombre: { type: String, required: true },
        apellido: { type: String, required: true },
        fechaNacimiento: { type: Date, required: true },
        genero: {
          type: String,
          enum: ["Masculino", "Femenino", "Otro"],
          required: true,
        },
        numeroDocumento: { type: String, required: true }, // Ej: Pasaporte, DNI, INE
        tipoDocumento: {
          type: String,
          required: true,
          enum: ["Pasaporte", "INE", "Cedula", "Otro"],
        },
        emailContacto: { type: String, required: false }, // Email específico para este pasajero si es diferente al del usuario
        telefonoContacto: { type: String, required: false },

        asientoAsignado: { type: String, default: null }, // El asiento real asignado

        // --- Campos para Check-in y Equipaje ---
        checkedIn: { type: Boolean, default: false },
        checkInTime: { type: Date },
        boardingPassUrl: { type: String }, // URL para descargar el pase de abordar
        boardingPassId: { type: String, unique: true, sparse: true }, // ID único para el pase de abordar (ej: para QR/código de barras)

        equipajeFacturado: [
          {
            pesoKg: { type: Number, default: 0, min: 0 },
            tagId: { type: String, unique: true, sparse: true }, // ID único de la etiqueta de la maleta
            cargoAplicado: { type: Number, default: 0, min: 0 }, // Cargo individual para esta maleta si excede límites
          },
        ],
        // Puedes añadir aquí el equipaje de mano si necesitas un seguimiento explícito
        // equipajeMano: [{ pesoKg: Number }],
        // --- Fin de Check-in y Equipaje ---
      },
    ],

    estadoReservacion: {
      // Podrías tener un estado global de la reservación
      type: String,
      enum: [
        "Pendiente de Pago",
        "Confirmada",
        "Cancelada",
        "Check-in Pendiente",
        "Check-in Completo",
      ],
      default: "Confirmada", // O el estado inicial de tu flujo
    },
    cargosAdicionalesEquipaje: { type: Number, default: 0 }, // Total de cargos por equipaje para toda la reserva
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Reservacion", reservacionSchema);
