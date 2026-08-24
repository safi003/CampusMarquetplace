import { Router } from "express";
import { getMyNotifications, markAllRead } from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getMyNotifications);
router.post("/read-all", markAllRead);

export default router;
