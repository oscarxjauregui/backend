import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createUser = async (req, res) => {
  const { nombre, apellido, email, password, telefono, direccion, rol } =
    req.body;

  if (!nombre || !apellido || !email || !password || !telefono || !direccion) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const pasaporte = `${nombre.toLowerCase()}_${apellido.toLowerCase()}_pasaporte.png`; 

    const newUser = new User({
      nombre,
      apellido,
      email,
      password: passwordHash,
      telefono,
      direccion,
      pasaporte,
      rol,
    });

    const userSaved = await newUser.save();

    res.status(201).json({
      id: userSaved._id,
      nombre: userSaved.nombre,
      apellido: userSaved.apellido,
      email: userSaved.email,
      pasaporte: userSaved.pasaporte,
      telefono: userSaved.telefono,
      direccion: userSaved.direccion,
      rol: userSaved.rol,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
    });
  } catch (e) {
    console.error("Error al crear usuario por admin:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Error al crear usuario: El email ya está registrado.",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages });
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear usuario" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console;
  }
};

export const searchUsers = async (req, res) => {
  try {
    const filter = {};
    const { nombre, apellido, email, rol } = req.query;

    if (nombre) {
      filter.nombre = { $regex: nombre, $options: "i" };
    }
    if (apellido) {
      filter.apellido = { $regex: apellido, $options: "i" };
    }
    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }
    if (rol) {
      filter.rol = rol;
    }

    const users = await User.find(filter).select("-password");
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(["ID de usuario inválido."]);
  }

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json(["Usuario no encontrado."]);
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(`Error al obtener usuario ${userId}:`, error);
    res.status(500).json(["Error interno del servidor al obtener usuario."]);
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json(["ID de usuario inválido."]);
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json(["Usuario no encontrado."]);
    }

    res.status(200).json({
      message: "Usuario eliminado exitosamente",
      userEmail: deletedUser.email,
    });
  } catch (error) {
    console.error(`Error al eliminar usuario ${userId}:`, error);
    res.status(500).json(["Error interno del servidor al eliminar usuario."]);
  }
};

export const getUsersByRole = async (req, res) => {
  const { rol } = req.params;
  try {
    const users = await User.find({ rol: rol }).select("-password"); 
    res.status(200).json(users);
  } catch (error) {
    console.error(`Error al obtener usuarios con rol ${rol}:`, error);
    res.status(500).json({
      message: "Error interno del servidor al obtener usuarios por rol.",
    });
  }
};

export const getPilotos = async (req, res) => {
  try {
    const capitanes = await User.find({ rol: "Piloto" }).select("-password"); 
    res.status(200).json(capitanes);
  } catch (error) {
    console.error("Error al obtener capitanes:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al obtener capitanes." });
  }
};

export const getAzafatas = async (req, res) => {
  try {
    const azafatas = await User.find({ rol: "Azafata" }).select("-password"); 
    res.status(200).json(azafatas); 
  } catch (error) {
    console.error("Error al obtener azafatas:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al obtener azafatas." });
  }
};

export const userUpload = async (req, res) => {
  const { userId } = req.params; 
  const {
    nombre,
    apellido,
    email,
    password,
    telefono,
    direccion,
    rol,
    pasaporte,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "ID de usuario inválido." });
  }

  try {
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (nombre !== undefined) userToUpdate.nombre = nombre;
    if (apellido !== undefined) userToUpdate.apellido = apellido;
    if (email !== undefined && userToUpdate.email !== email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (
        existingUserWithEmail &&
        String(existingUserWithEmail._id) !== String(userId)
      ) {
        return res
          .status(400)
          .json({
            message: "El nuevo email ya está registrado por otro usuario.",
          });
      }
      userToUpdate.email = email;
    }
    if (telefono !== undefined) userToUpdate.telefono = telefono;
    if (direccion !== undefined) userToUpdate.direccion = direccion;
    if (rol !== undefined) userToUpdate.rol = rol;
    if (pasaporte !== undefined) userToUpdate.pasaporte = pasaporte; 

    if (password) {
      userToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await userToUpdate.save();

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    res.status(200).json({
      message: "Datos de usuario actualizados exitosamente",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(`Error al actualizar datos del usuario ${userId}:`, error);
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Error al actualizar: Ya existe un registro con este dato (ej. email).",
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages });
    }
    res
      .status(500)
      .json({
        message: "Error interno del servidor al actualizar datos del usuario.",
      });
  }
};
