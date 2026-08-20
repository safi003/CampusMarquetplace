import { Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator";

const orderInclude = {
  product: { include: { images: true } },
  buyer: { select: { id: true, name: true } },
  seller: { select: { id: true, name: true } },
};

export async function createOrder(req: Request, res: Response) {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const { productId, mode } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    if (product.isSold) {
      return res.status(400).json({ message: "Ce produit a déjà été vendu" });
    }
    if (product.sellerId === req.user!.id) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas acheter votre propre produit" });
    }

    const order = await prisma.order.create({
      data: {
        productId,
        mode,
        buyerId: req.user!.id,
        sellerId: product.sellerId,
      },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { isSold: true },
    });

    const created = await prisma.order.findUnique({
      where: { id: order.id },
      include: orderInclude,
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function getMyOrders(req: Request, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ buyerId: req.user!.id }, { sellerId: req.user!.id }],
      },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const parsed = updateOrderStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const { status } = parsed.data;
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    if (order.buyerId !== req.user!.id && order.sellerId !== req.user!.id) {
      return res
        .status(403)
        .json({ message: "Vous ne participez pas à cette commande" });
    }

    if (status === "CANCELLED" && order.status === "PENDING") {
      await prisma.product.update({
        where: { id: order.productId },
        data: { isSold: false },
      });
    }

    await prisma.order.update({
      where: { id },
      data: { status },
    });

    const updated = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}