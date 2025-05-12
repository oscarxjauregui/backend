export const adminRequired = (req, res, next) => {
  if (req.user && req.user.rol === "admin") {
    next();
  } else {
    return res
      .status(401)
      .json({ message: "No tienes permiso de adminsitrador" });
  }
};
