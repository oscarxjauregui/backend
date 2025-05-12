import mongoose from "mongoose";

const equipajeSchema = new mongoose.Schema(
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
    pesoKg: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Equipaje", equipajeSchema);
