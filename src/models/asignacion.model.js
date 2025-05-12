import mongoose from "mongoose";

const asignacionSchema = new mongoose.Schema(
  {
    vueloId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vuelo",
      required: true,
    },
    capitanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tripulacionId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamp: true,
  }
);

export default mongoose.model("Asignacion", asignacionSchema);
