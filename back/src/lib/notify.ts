import type { Server } from "socket.io";
import prisma from "./prisma";

export async function notifyUser(
  io: Server | null | undefined,
  data: { userId: number; type: string; content: string; link?: string }
) {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      content: data.content,
      link: data.link ?? null,
    },
  });
  io?.to(`user:${data.userId}`).emit("notification:new", notification);
  return notification;
}
