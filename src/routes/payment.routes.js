import { Router } from "express";

const router = Router();

router.get("/create-checkout-session", (req, res) => res.send("checkout"));
router.post("/success", (req, res) => res.send("success"));
router.post("/cancel", (req, res) => res.send("cancel"));

export default router;
