import { Router } from "express";
import { register, login , getMe} from "../controllers/auth.controller";
import { upload } from "../middlewares/upload.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", upload.single("imageCarteScolaire"), register);
router.post("/login", login);
router.get("/me", authenticate, getMe);


export default router;