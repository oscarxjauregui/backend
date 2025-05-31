export const adminRequired = (req, res, next) => {
  console.log('------------------------------------');
  console.log('Contenido de req.user en adminRequired:');
  console.log(req.user); 
  console.log('Rol del usuario (req.user.rol):', req.user ? req.user.rol : 'undefined o null');
  console.log('------------------------------------');

  if (req.user && req.user.rol === "admin") {
    next();
  } else {
    return res
      .status(401)
      .json({ message: "No tienes permiso de administrador" }); 
  }
};