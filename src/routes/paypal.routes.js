// backend/src/routes/paypal.routes.js
import { Router } from 'express';
import { createPayPalOrder, capturePayPalOrder } from '../controllers/paypal.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

router.post('/paypal/create-order', authRequired, createPayPalOrder);
router.post('/paypal/capture-order', authRequired, capturePayPalOrder);

export default router;