import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function addToWishlist(req: Request, res: Response) {
  try {
    const productId = Number(req.params.productId);
    const userId = req.user!.id;

    const wishlistItem = await prisma.wishlist.create({
      data: { userId, productId },
    });

    return res.status(201).json(wishlistItem);
  } catch (error: any) {
    // code P2002 = violation de contrainte unique (Prisma)
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Produit déjà dans la wishlist" });
    }
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function removeFromWishlist(req: Request, res: Response) {
  try {
    const productId = Number(req.params.productId);
    const userId = req.user!.id;

    await prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });

    return res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Produit non trouvé dans la wishlist" });
    }
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function getMyWishlist(req: Request, res: Response) {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: { category: true, seller: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(wishlist);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}