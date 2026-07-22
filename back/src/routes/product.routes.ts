import { Router } from "express";
import { createProduct, getProducts, getProductById } from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { uploadProductImages } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticate, uploadProductImages.array("images", 5), createProduct);

export default router;