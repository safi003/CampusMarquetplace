import { Router } from "express";
import { addToWishlist, removeFromWishlist, getMyWishlist } from "../controllers/wishlist.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate); // toutes les routes wishlist nécessitent d'être connecté

router.get("/", getMyWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;