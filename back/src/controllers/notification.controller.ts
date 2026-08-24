import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getMyNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
