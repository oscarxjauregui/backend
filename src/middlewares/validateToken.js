import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import User from "../models/user.model.js";

export const authRequired = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token)
    return res
      .status(401)
      .json({ message: "No token, autorizacion necesaria" });

  jwt.verify(token, TOKEN_SECRET, async (error, userPayload) => {
    if (error) {
      return res.status(403).json({ message: "Token invalido" });
    }

    try {
      const foundUser = await User.findById(userPayload.id);

      console.log("--- Debugging authRequired middleware ---");
      console.log("userPayload del token:", userPayload);
      console.log("foundUser DESPUÉS del await:", foundUser);
      console.log(
        "req.user.rol:",
        foundUser ? foundUser.rol : "foundUser es nulo/indefinido"
      );
      console.log("---------------------------------------");

      if (!foundUser) {
        return res
          .status(404)
          .json({ message: "Usuario no encontrado en la base de datos" });
      }
      req.user = foundUser;

      next(); 
    } catch (dbError) {
      console.error("Error al buscar usuario en la base de datos:", dbError);
      return res
        .status(500)
        .json({ message: "Error interno del servidor al autenticar" });
    }
  });
};
