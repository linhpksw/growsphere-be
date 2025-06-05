import express from 'express';
import { createPreOrder, getPreOrderStatus, handleWebhook } from './payment.controller';

const router = express.Router();

// 1) POST /payments/preorder
router.post('/preorder', createPreOrder);

// 2) GET /payments/status?code=XXXXXX
router.get('/status', getPreOrderStatus);

// 3) POST /payments/webhook
//    (public URL that Casso or Postman can call to simulate a payment)
//    You do NOT need any authentication here (for testing).
router.post('/webhook', handleWebhook);

export default router;
