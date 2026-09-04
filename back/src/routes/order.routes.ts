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
router.get("/product/:productId/queue", authenticate, getProductQueue);
router.get("/:id", authenticate, getOrderById);
router.patch("/:id", authenticate, updateOrderStatus);
router.patch("/:id/activate", authenticate, activateOrder);
router.patch("/:id/confirm", authenticate, confirmOrder);
router.patch("/:id/release-payment", authenticate, requireAdmin, releasePayment);
router.patch("/:id/lock-secured", authenticate, requireAdmin, lockSecuredOrder);

export default router;