import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { uploadFile, generateKey, removeFile } from "../lib/storage";
import { createProductSchema } from "../validators/product.validator";

export async function createProduct(req: Request, res: Response) {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const { name, description, price, categoryId, address, handDelivery } = parsed.data;

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Au moins une photo est requise" });
    }

    const seller = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!seller?.imageCarteScolaire) {
      return res.status(403).json({ message: "Ajoutez votre pièce d'identité avant de publier une annonce" });
    }
    if (seller.cardStatus !== "APPROVED") {
      return res.status(403).json({
        message:
          seller.cardStatus === "REJECTED"
            ? "Votre pièce d'identité a été refusée. Veuillez la renvoyer pour revalidation."
            : "Votre pièce d'identité est en attente de vérification par un administrateur.",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        address,
        handDelivery,
        categoryId,
        sellerId: req.user!.id,
      },
    });

    for (const file of files) {
      const key = generateKey("uploads/products", file.originalname);
      const objectKey = await uploadFile(file.buffer, key, file.mimetype);
      await prisma.productImage.create({
        data: { url: objectKey, productId: product.id },
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

export async function deleteProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    if (product.sellerId !== req.user!.id) {
      return res.status(403).json({ message: "Vous n'êtes pas le propriétaire de ce produit" });
    }

    for (const img of product.images) {
      await removeFile(img.url);
    }

    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ message: "Produit supprimé" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    if (product.sellerId !== req.user!.id) {
      return res.status(403).json({ message: "Vous n'êtes pas le propriétaire de ce produit" });
    }

    const { name, description, price, categoryId, address,  handDelivery} = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
        ...(address !== undefined && { address }),
        ...(handDelivery !== undefined && { handDelivery: handDelivery === true || handDelivery === "true" }),
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}