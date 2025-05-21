import { Router } from "express";
import {
  createUser,
  getUsers,
  getUser,
  deleteUser,
  getUsersByRole,
  getPilotos,
  getAzafatas,
} from "../controllers/users.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { adminRequired } from "../middlewares/validateAdmin.js";

const router = Router();

router.post("/createUser", authRequired, adminRequired, createUser);

router.get("/getUsers", authRequired, getUsers);

router.get("/getUser/:userId", authRequired, getUser);

router.delete("/deleteUser/:userId", authRequired, adminRequired, deleteUser);

router.get(
  "/getUsersByRole/:role",
  authRequired,
  adminRequired,
  getUsersByRole
);

router.get("/pilotos", authRequired, getPilotos);

router.get("/azafatas", authRequired, getAzafatas);

export default router;
