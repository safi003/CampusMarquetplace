import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import categoryRoutes from "./routes/category.routes";
import reviewRoutes from "./routes/review.routes";
import userRoutes from "./routes/user.routes";
import { getFileStream } from "./lib/storage";

import path from "path";


const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://172.20.10.2:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Sert les fichiers depuis RustFS (avec fallback disque pour les anciens fichiers)
app.get("/uploads/:dir/:file", async (req, res) => {
  const key = `uploads/${req.params.dir}/${req.params.file}`;
  try {
    const stream = await getFileStream(key);
    stream.pipe(res);
  } catch {
    const localPath = path.join(__dirname, "..", "uploads", req.params.dir, req.params.file);
    if (fs.existsSync(localPath)) {
      return res.sendFile(localPath);
    }
    res.status(404).json({ message: "Fichier introuvable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/sellers", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
