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
    asientos: { type: Number, required: true, min: 1 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Reservacion", reservacionSchema);
