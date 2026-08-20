import { Router } from "express";
import {
  getConversations,
  getConversation,
  sendMessage,
} from "../controllers/message.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/conversations", authenticate, getConversations);
router.get("/:userId", authenticate, getConversation);
router.post("/", authenticate, sendMessage);

export default router;