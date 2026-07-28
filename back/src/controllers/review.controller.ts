import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { z } from "zod";

const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Minimum 1 étoile").max(5, "Maximum 5 étoiles"),
  comment: z.string().optional(),
});

export async function getSellerReviews(req: Request, res: Response) {
  try {
    const sellerId = Number(req.params.sellerId);
    const reviews = await prisma.review.findMany({
      where: { sellerId },
      include: { reviewer: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const avg = await prisma.review.aggregate({
      where: { sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return res.json({
      reviews,
      averageRating: avg._avg.rating ?? 0,
      totalReviews: avg._count.rating,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function createReview(req: Request, res: Response) {
  try {
    const sellerId = Number(req.params.sellerId);
    const reviewerId = req.user!.id;

    if (reviewerId === sellerId) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous évaluer vous-même" });
    }

    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const existing = await prisma.review.findFirst({
      where: { reviewerId, sellerId },
    });
    if (existing) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis pour ce vendeur" });
    }

    await prisma.review.create({
      data: { ...parsed.data, reviewerId, sellerId },
    });

    const review = await prisma.review.findFirst({
      where: { reviewerId, sellerId },
      include: { reviewer: { select: { id: true, name: true } } },
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
