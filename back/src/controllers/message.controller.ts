import { Request, Response } from "express";
import prisma from "../lib/prisma";

const messageInclude = {
  sender: { select: { id: true, name: true } },
  receiver: { select: { id: true, name: true } },
};

export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { timestamp: "desc" },
      include: messageInclude,
    });

    const conversationsMap = new Map<number, any>();
    for (const msg of messages) {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationsMap.has(otherId)) {
        const other = msg.senderId === userId ? msg.receiver : msg.sender;
        conversationsMap.set(otherId, {
          otherUser: other,
          lastMessage: msg,
          unreadCount: 0,
        });
      }
      if (msg.receiverId === userId && !msg.isRead) {
        conversationsMap.get(otherId).unreadCount += 1;
      }
    }

    return res.status(200).json(Array.from(conversationsMap.values()));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function getConversation(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const otherUserId = Number(req.params.userId);

    if (otherUserId === userId) {
      return res.status(400).json({ message: "Conversation invalide" });
    }

    const unreadMessages = await prisma.message.findMany({
      where: { senderId: otherUserId, receiverId: userId, isRead: false },
      select: { id: true },
    });

    for (const msg of unreadMessages) {
      await prisma.message.update({
        where: { id: msg.id },
        data: { isRead: true },
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { timestamp: "asc" },
      include: messageInclude,
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const receiverId = Number(req.body.receiverId);
    const content = String(req.body.content ?? "").trim();

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Paramètres invalides" });
    }
    if (receiverId === req.user!.id) {
      return res.status(400).json({ message: "Impossible de s'envoyer un message" });
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return res.status(404).json({ message: "Destinataire introuvable" });
    }
    if (receiver.role === "ADMIN") {
      return res
        .status(403)
        .json({ message: "Ces messages sont informatifs, vous ne pouvez pas y répondre." });
    }

    const created = await prisma.message.create({
      data: { senderId: req.user!.id, receiverId, content },
    });

    const message = await prisma.message.findUnique({
      where: { id: created.id },
      include: messageInclude,
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}