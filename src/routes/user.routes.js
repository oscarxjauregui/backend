import { Router } from "express";
import {
  createUser,
  getUsers,
  getUser,
  deleteUser,
} from "../controllers/users.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { adminRequired } from "../middlewares/validateAdmin.js";

const router = Router();

router.post("/createUser", authRequired, createUser);

router.get("/getUsers", authRequired, getUsers);

router.get("/getUser/:userId", authRequired, getUser);

router.delete("/deleteUser/:userId", authRequired, deleteUser);



export default router;
