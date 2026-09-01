import session from "express-session";
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
import adminRoutes from "./routes/admin.routes";
import notificationRoutes from "./routes/notification.routes";
import { getFileStream } from "./lib/storage";
import orderRoutes from "./routes/order.routes";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocket } from "./socket";
import messageRoutes from "./routes/message.routes";



const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://172.20.10.2:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    },
  })
);
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
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});
setupSocket(io);
app.set("io", io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
