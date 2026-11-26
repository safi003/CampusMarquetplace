import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getActiveOrderForProduct,
  updateOrderStatus,
  confirmOrder,
  releasePayment,
  lockSecuredOrder,
  getOrderById,
  lockDirectOrder
} from "../controllers/order.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getMyOrders);
router.get("/product/:productId/active", getActiveOrderForProduct);
router.get("/:id", authenticate, getOrderById);
router.patch("/:id", authenticate, updateOrderStatus);
router.patch("/:id/confirm", authenticate, confirmOrder);
router.patch("/:id/release-payment", authenticate, requireAdmin, releasePayment);
router.patch("/:id/lock-secured", authenticate, requireAdmin, lockSecuredOrder);
router.patch("/:id/lock-direct", authenticate, lockDirectOrder);


export default router;