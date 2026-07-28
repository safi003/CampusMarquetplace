import { Router } from "express";
import { getSeller } from "../controllers/user.controller";

const router = Router();

router.get("/:id", getSeller);

export default router;
