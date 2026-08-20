import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getMyOrders);
router.patch("/:id", authenticate, updateOrderStatus);

export default router;