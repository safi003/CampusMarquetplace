import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getSeller(req: Request, res: Response) {
  try {
    const sellerId = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { products: { where: { isSold: false } } } },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Vendeur introuvable" });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
