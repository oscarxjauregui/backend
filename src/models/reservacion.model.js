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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Reservacion", reservacionSchema);
