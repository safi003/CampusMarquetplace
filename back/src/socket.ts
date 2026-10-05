import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma";
import { notifyUser } from "./lib/notify";

export function setupSocket(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Token manquant"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: number;
      };
      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error("Token invalide"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as number;
    socket.join(`user:${userId}`);

    socket.on("message:send", async (payload, ack) => {
      try {
        const receiverId = Number(payload?.receiverId);
        const content = String(payload?.content ?? "").trim();

        if (!receiverId || !content) {
          return ack?.({ ok: false, message: "Paramètres invalides" });
        }
        if (receiverId === userId) {
          return ack?.({ ok: false, message: "Impossible de s'envoyer un message" });
        }

        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) {
          return ack?.({ ok: false, message: "Destinataire introuvable" });
        }
        if (receiver.role === "ADMIN") {
          return ack?.({
            ok: false,
            message: "Ces messages sont informatifs, vous ne pouvez pas y répondre.",
          });
        }

        const created = await prisma.message.create({
          data: { senderId: userId, receiverId, content },
        });
        const message = await prisma.message.findUnique({
          where: { id: created.id },
          include: {
            sender: { select: { id: true, name: true } },
            receiver: { select: { id: true, name: true } },
          },
        });

        io.to(`user:${receiverId}`).emit("message:new", message);

        // Notifie le destinataire quand le message provient d'un administrateur
        const sender = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        if (sender?.role === "ADMIN") {
          await notifyUser(io, {
            userId: receiverId,
            type: "ADMIN_MESSAGE",
            content: "Un administrateur vous a envoyé un message.",
            link: "/chat",
          });
        }

        ack?.({ ok: true, message });
      } catch (error) {
        console.error(error);
        ack?.({ ok: false, message: "Erreur serveur" });
      }
    });

    socket.on("disconnect", () => {
      socket.leave(`user:${userId}`);
    });
  });
}