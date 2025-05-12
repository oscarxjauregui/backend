import mongoose, { mongo } from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://oscar:Oscarjaro8@clustertedw.oixv6.mongodb.net/ProyectoFinal"
    );
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
};
