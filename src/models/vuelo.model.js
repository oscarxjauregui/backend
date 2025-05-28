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
    reglasEquipaje: {
      equipajeManoKg: { type: Number, default: 8 },
      equipajeFacturadoGratis: { type: Number, default: 1 },
      pesoMaxFacturadoKgPorMaleta: { type: Number, default: 23 },
      cargoMaletaAdicional: { type: Number, default: 500 },
      cargoExcesoPesoKg: { type: Number, default: 100 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Vuelo", vueloSchema);
