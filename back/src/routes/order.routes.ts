import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getProductQueue,
  updateOrderStatus,
  activateOrder,
  confirmOrder,
  releasePayment,
  lockSecuredOrder,
  getOrderById,
} from "../controllers/order.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getMyOrders);
router.patch("/:id", authenticate, updateOrderStatus);
router.get("/orders/:id", authenticate, getOrderById);
router.get("/orders/product/:productId/queue", authenticate, getProductQueue);
router.patch("/orders/:id/activate", authenticate, activateOrder);
router.patch("/orders/:id/confirm", authenticate, confirmOrder);
router.patch("/orders/:id/release-payment",authenticate, requireAdmin, releasePayment);
router.patch("/orders/:id/lock-secured", authenticate, requireAdmin, lockSecuredOrder);
export default router;