import { Router } from "express";
import { getUsers, approveCard, rejectCard, getOrders } from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", getUsers);
router.get("/orders", getOrders); 
router.post("/users/:id/approve", approveCard);
router.post("/users/:id/reject", rejectCard);

export default router;
