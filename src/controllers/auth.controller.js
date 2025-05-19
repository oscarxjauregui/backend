import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const register = async (req, res) => {
  const { nombre, apellido, email, password, telefono, direccion } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).json(["The email is already exists"]);

    const passwordHash = await bcrypt.hash(password, 10);
    const pasaporte = `${nombre.toLowerCase()}_${apellido.toLowerCase()}_pasaporte.png`;
    const rol = "Cliente";

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
    const token = await createAccessToken({ id: userSaved._id });

    res.cookie("token", token);
    res.json({
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
    res.status(400).json({ message: e.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (!userFound) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = await createAccessToken({ id: userFound._id });

    res.cookie("token", token);
    res.json({
      id: userFound._id,
      nombre: userFound.nombre,
      apellido: userFound.apellido,
      email: userFound.email,
      pasaporte: userFound.pasaporte,
      telefono: userFound.telefono,
      direccion: userFound.direccion,
      rol: userFound.rol,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);

  if (!userFound) return res.status(400).json({ message: "User not found" });

  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    rol: userFound.rol,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });

    const userFound = await User.findById(user.id);
    if (!userFound) return res.status(401).json({ message: "Unauthorized" });

    return res.json({
      id: userFound._id,
      nombre: userFound.nombre,
      apellido: userFound.apellido,
      email: userFound.email,
      pasaporte: userFound.pasaporte,
      telefono: userFound.telefono,
      direccion: userFound.direccion,
      rol: userFound.rol,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  });
};
