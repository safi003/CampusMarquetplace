import { Router } from "express";
import { register, login, googleLogin, getMe, uploadCarteScolaire, githubLogin, githubCallback, googleCallback} from "../controllers/auth.controller";
import { upload } from "../middlewares/upload.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", upload.single("imageCarteScolaire"), register);
router.post("/login", login);

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

router.get("/me", authenticate, getMe);
router.put("/carte", authenticate, upload.single("imageCarteScolaire"), uploadCarteScolaire);


export default router;