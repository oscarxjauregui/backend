import mongoose from "mongoose";

const vueloSchema = new mongoose.Schema(
  {
    origen: {
      type: String,
      required: true,
    },
    destino: {
      type: String,
      required: true,
    },
    fechaSalida: {
      type: Date,
      required: true,
    },
    fechaLlegada: {
      type: Date,
      required: true,
    },
    costo: {
      type: Number,
      required: true,
    },
    asientosDisponibles: {
      type: Number,
      required: true,
    },
    avion: {
      type: String,
      required: true,
    },
    aerolinea: {
      type: String,
      required: true,
    },
    piloto: {
      type: String,
      required: true,
    },
    copiloto: {
      type: String,
    },
    azafata1: {
      type: String,
    },
    azafata2: {
      type: String,
    },
    azafata3: {
      type: String,
    },
    estado: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Vuelo", vueloSchema);
