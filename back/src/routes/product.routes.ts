import { Router } from "express";
import { createProduct, getProducts, getProductById, deleteProduct, updateProduct } from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { uploadProductImages } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticate, uploadProductImages.array("images", 5), createProduct);
router.delete("/:id", authenticate, deleteProduct);
router.patch("/:id", authenticate, updateProduct);
export default router;