import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { createProductSchema } from "../validators/product.validator";

export async function createProduct(req: Request, res: Response) {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const { name, description, price, categoryId, address } = parsed.data;

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Au moins une photo est requise" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        address,
        categoryId,
        sellerId: req.user!.id,
      },
    });

    for (const file of files) {
      await prisma.productImage.create({
        data: { url: file.path, productId: product.id },
      });
    }

    const productWithImages = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true },
    });

    return res.status(201).json(productWithImages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function getProducts(req: Request, res: Response) {
  try {
    const { search, categoryId, sellerId } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isSold: false,
        ...(search && {
          name: { contains: String(search), mode: "insensitive" },
        }),
        ...(categoryId && { categoryId: Number(categoryId) }),
        ...(sellerId && { sellerId: Number(sellerId) }),
      },
      include: {
        seller: { select: { id: true, name: true } }, // jamais le password
        category: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        seller: { select: { id: true, name: true } },
        category: true,
        images: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}