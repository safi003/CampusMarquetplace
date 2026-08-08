import { Router } from "express";
import { getUsers, approveCard, rejectCard } from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", getUsers);
router.post("/users/:id/approve", approveCard);
router.post("/users/:id/reject", rejectCard);

export default router;
