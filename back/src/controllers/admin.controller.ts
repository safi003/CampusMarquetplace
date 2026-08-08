import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { z } from "zod";

const rejectSchema = z.object({
  reason: z.string().min(3, "Merci de préciser le motif du refus").max(500),
});

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageCarteScolaire: true,
        cardStatus: true,
        cardRejectionReason: true,
        createdAt: true,
        reviewsReceived: { select: { rating: true } },
        _count: { select: { products: true } },
      },
    });

    const data = users.map((u) => {
      const totalReviews = u.reviewsReceived.length;
      const averageRating =
        totalReviews > 0
          ? u.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        imageCarteScolaire: u.imageCarteScolaire,
        cardStatus: u.cardStatus,
        cardRejectionReason: u.cardRejectionReason,
        createdAt: u.createdAt,
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews,
        totalProducts: u._count.products,
      };
    });

    // Classés par nombre d'étoiles (moyenne) décroissant, puis par nb d'avis
    data.sort((a, b) => b.averageRating - a.averageRating || b.totalReviews - a.totalReviews);

    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function approveCard(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);
    const user = await prisma.user.update({
      where: { id: userId },
      data: { cardStatus: "APPROVED", cardRejectionReason: null },
    });

    const { password: _, ...publicUser } = user;
    return res.json(publicUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function rejectCard(req: Request, res: Response) {
  try {
    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const userId = Number(req.params.id);
    const user = await prisma.user.update({
      where: { id: userId },
      data: { cardStatus: "REJECTED", cardRejectionReason: parsed.data.reason },
    });

    const { password: _, ...publicUser } = user;
    return res.json(publicUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
