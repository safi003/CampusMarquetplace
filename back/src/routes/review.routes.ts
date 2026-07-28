import { Router } from "express";
import { getSellerReviews, createReview } from "../controllers/review.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:sellerId", getSellerReviews);
router.post("/:sellerId", authenticate, createReview);

export default router;
