import { Request, Response } from "express";
import type { Server } from "socket.io";
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
import { checkAndExpireActiveOrder, notify } from "../services/order.service";
import { notifyUser } from "../lib/notify";


export async function createOrder(req: Request, res: Response) {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }
    const { productId, mode, paymentType } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    if (product.sellerId === req.user!.id) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas acheter votre propre produit" });
    }
    if (product.status === "SOLD") {
      return res.status(400).json({ message: "Ce produit a déjà été vendu" });
    }

    const existing = await prisma.order.findFirst({
      where: {
        productId,
        buyerId: req.user!.id,
        status: { in: ["PENDING", "ACTIVE"] },
      },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Vous avez déjà une demande en cours pour ce produit" });
    }

    await checkAndExpireActiveOrder(productId);
    const io = req.app.get("io") as Server | undefined;

    const order = await prisma.$transaction(async (tx) => {
      const hasActiveOrder = await tx.order.findFirst({
        where: { productId, status: "ACTIVE" },
      });

      const created = await tx.order.create({
        data: {
          productId,
          mode,
          paymentType: paymentType ?? "DIRECT",
          buyerId: req.user!.id,
          sellerId: product.sellerId,
          status: hasActiveOrder ? "PENDING" : "ACTIVE",
          activatedAt: hasActiveOrder ? null : new Date(),
          expiresAt: hasActiveOrder ? null : new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      if (!hasActiveOrder) {
        await tx.product.update({
          where: { id: productId },
          data: { status: "RESERVED" },
        });
      }

      return tx.order.findUnique({
        where: { id: created.id },
        include: orderInclude,
      });
    });

    if (order!.status === "ACTIVE") {
      await notify(
        product.sellerId,
        "NEW_ORDER",
        `${order!.buyer.name} souhaite acheter "${product.name}"`,
        `/orders/${order!.id}`,
        io
      );
    } else {
      await notify(
        product.sellerId,
        "NEW_ORDER_WAITING",
        `${order!.buyer.name} veut aussi acheter "${product.name}" (en file d'attente)`,
        `/orders/product/${product.id}/queue`,
        io
      );
    }

    if (order!.paymentType === "SECURED") {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });
      const io = req.app.get("io");
      for (const admin of admins) {
        await notifyUser(io, {
          userId: admin.id,
          type: "PAYMENT_VERIFICATION",
          content: `Paiement sécurisé à vérifier : "${product.name}" (${order!.buyer.name})`,
          link: "/admin",
        });
      }
    }
    return res.status(201).json(order);
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


export async function getOrderById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    await checkAndExpireActiveOrder(
      (await prisma.order.findUnique({ where: { id } }))?.productId ?? -1
    );

    const order = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    if (
      order.buyerId !== req.user!.id &&
      order.sellerId !== req.user!.id &&
      req.user!.role !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ message: "Vous ne participez pas à cette commande" });
    }

    return res.status(200).json(order);
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

    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    if (order.buyerId !== req.user!.id && order.sellerId !== req.user!.id) {
      return res.status(403).json({ message: "Vous ne participez pas à cette commande" });
    }
    if (order.status !== "PENDING" && order.status !== "ACTIVE") {
      return res.status(400).json({ message: "Cette commande ne peut plus être annulée" });
    }
    if (
      order.status === "ACTIVE" &&
      (order.paymentLockedByStaff || order.sellerLockedPayment)
    ) {
      return res.status(400).json({ message: "Paiement déjà verrouillé — annulation impossible" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: "CANCELLED", expiresAt: null },
      });

      if (order.status === "ACTIVE") {
        const next = await tx.order.findFirst({
          where: { productId: order.productId, status: "PENDING" },
          orderBy: { createdAt: "asc" },
        });

        if (next) {
          await tx.order.update({
            where: { id: next.id },
            data: {
              status: "ACTIVE",
              activatedAt: new Date(),
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
          });
        } else {
          await tx.product.update({
            where: { id: order.productId },
            data: { status: "AVAILABLE" },
          });
        }
      } else {
        const stillActive = await tx.order.findFirst({
          where: { productId: order.productId, status: "ACTIVE" },
        });

        if (!stillActive) {
          await tx.product.update({
            where: { id: order.productId },
            data: { status: "AVAILABLE" },
          });
        }
      }

      return tx.order.findUnique({ where: { id }, include: orderInclude });
    });
    const io = req.app.get("io") as Server | undefined;

    const recipientId = order.buyerId === req.user!.id ? order.sellerId : order.buyerId;
    await notify(recipientId, "ORDER_CANCELLED", "Une commande a été annulée", `/orders/${id}`,io);

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function getProductQueue(req: Request, res: Response) {
  try {
    const productId = Number(req.params.productId);
    
    await checkAndExpireActiveOrder(productId);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }
    if (product.sellerId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas le vendeur de ce produit" });
    }

    const orders = await prisma.order.findMany({
      where: {
        productId,
        status: { in: ["ACTIVE", "PENDING"] },
      },
      include: {
        buyer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" }, // premier arrivé, premier affiché
    });

    const active = orders.find((o) => o.status === "ACTIVE") ?? null;
    const waiting = orders.filter((o) => o.status === "PENDING");

    return res.status(200).json({
      productId,
      productStatus: product.status,
      active,
      waitingList: waiting,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function activateOrder(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    if (order.sellerId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à activer cette commande" });
    }
    if (order.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Cette commande n'est pas en attente" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // vérifie qu'il n'y a pas déjà une commande ACTIVE sur ce produit
      const alreadyActive = await tx.order.findFirst({
        where: { productId: order.productId, status: "ACTIVE" },
      });
      if (alreadyActive) {
        throw { status: 409, code: "ALREADY_HAS_ACTIVE_ORDER" };
      }

      const activated = await tx.order.update({
        where: { id },
        data: {
          status: "ACTIVE",
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      // le produit reste RESERVED (il l'était déjà pour la file d'attente)
      await tx.product.update({
        where: { id: order.productId },
        data: { status: "RESERVED" },
      });

      return activated;
    });

    const io = req.app.get("io") as Server | undefined;

await notifyUser(io, {
  userId: order.buyerId,
  type: "ORDER_ACTIVATED",
  content: `Votre commande pour "${order.product.name}" est activée. Vous avez 15 minutes pour confirmer.`,
  link: `/orders/${id}`,
});

await notifyUser(io, {
  userId: order.sellerId,
  type: "ORDER_ACTIVATED",
  content: `La commande de "${order.product.name}" est activée.`,
  link: `/orders/${id}`,
});

    return res.status(200).json(updated);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ message: error.code });
    }
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}


export async function confirmOrder(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    const isBuyer = order.buyerId === req.user!.id;
    const isSeller = order.sellerId === req.user!.id;

    if (!isBuyer && !isSeller) {
      return res
        .status(403)
        .json({ message: "Vous ne participez pas à cette commande" });
    }
    if (order.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Cette commande n'est pas active" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const data = isBuyer
        ? { buyerConfirmed: true }
        : { sellerConfirmed: true };

      const confirmed = await tx.order.update({
        where: { id },
        data,
        include: orderInclude,
      });
      const io = req.app.get("io") as Server | undefined;
      const recipientId = isBuyer ? confirmed.sellerId : confirmed.buyerId;
      await notify(
        recipientId,
        "ORDER_CONFIRMATION",
        isBuyer
          ? `${confirmed.buyer.name} a confirmé la transaction, à votre tour`
          : `${confirmed.seller.name} a confirmé la transaction, à votre tour`,
        `/orders/${id}`,
        io
      );

      if (confirmed.buyerConfirmed && confirmed.sellerConfirmed) {
        const completed = await tx.order.update({
          where: { id },
          data: {
            status: "COMPLETED",
          },
        });

        await tx.product.update({
          where: { id: confirmed.productId },
          data: { status: "SOLD" },
        });

        // annule les autres commandes en attente pour ce produit
        await tx.order.updateMany({
          where: {
            productId: confirmed.productId,
            status: "PENDING",
          },
          data: { status: "CANCELLED" },
        });

        return completed;
      }

      return confirmed;
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function releasePayment(req: Request, res: Response) {
  try {
    if (req.user!.role !== "ADMIN") {
      return res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }

    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    if (order.status !== "COMPLETED") {
      return res
        .status(400)
        .json({ message: "La commande doit être complétée avant de libérer les fonds" });
    }
    if (order.paymentType !== "SECURED" || order.paymentStatus !== "HELD") {
      return res
        .status(400)
        .json({ message: "Aucun paiement sécurisé en attente de libération" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { paymentStatus: "RELEASED" },
    });

    // ici, plus tard : appel réel au prestataire (PayDunya) pour transférer l'argent au vendeur

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}


export async function lockSecuredOrder(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: { select: { name: true } },
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
      },
    });
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    if (order.paymentType !== "SECURED") {
      return res
        .status(400)
        .json({ message: "Cette commande n'est pas en paiement sécurisé" });
    }
    if (order.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Seule une commande active peut être verrouillée" });
    }

    const alreadyLocked = order.paymentLockedByStaff || order.paymentStatus === "HELD";

    const updated = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: "HELD",
        paymentLockedByStaff: true,
      },
    });

    if (!alreadyLocked) {
      const io = req.app.get("io") as Server | undefined;
      await notifyUser(io, {
        userId: order.buyerId,
        type: "PAYMENT_LOCKED",
        content: `Votre paiement pour "${order.product.name}" a bien été reçu. L'argent est sécurisé et sera bloqué jusqu'à la réception de votre commande.`,
        link: `/orders/${id}`,
      });
      await notifyUser(io, {
        userId: order.sellerId,
        type: "PAYMENT_LOCKED",
        content: `Le paiement sécurisé de "${order.product.name}" est confirmé. L'argent est bloqué et sera libéré à la livraison. Vous pouvez effectuer la livraison avec ${order.buyer.name}.`,
        link: `/orders/${id}`,
      });

      await sendAdminMessage(
        io,
        req.user!.id,
        order.buyerId,
        `Bonjour ${order.buyer.name}, votre paiement pour "${order.product.name}" a bien été reçu par notre équipe. L'argent est sécurisé et sera reversé au vendeur uniquement après confirmation de la réception de votre commande.`
      );
      await sendAdminMessage(
        io,
        req.user!.id,
        order.sellerId,
        `Bonjour ${order.seller.name}, le paiement sécurisé pour "${order.product.name}" a été confirmé. L'argent est bloqué et sera libéré à la livraison. Vous pouvez procéder à la livraison pour ${order.buyer.name}.`
      );
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

async function sendAdminMessage(
  io: Server | null | undefined,
  senderId: number,
  receiverId: number,
  content: string
) {
  const created = await prisma.message.create({
    data: { senderId, receiverId, content },
  });
  const message = await prisma.message.findUnique({
    where: { id: created.id },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });
  io?.to(`user:${receiverId}`).emit("message:new", message);

  await notifyUser(io, {
    userId: receiverId,
    type: "ADMIN_MESSAGE",
    content: "Un administrateur vous a envoyé un message.",
    link: "/chat",
  });
}

export async function lockDirectOrder(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: { select: { name: true } },
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
      },
    });
    if (!order) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    if (order.sellerId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({ message: "Vous n'êtes pas le vendeur de ce produit" });
    }
    if (order.paymentType !== "DIRECT") {
      return res.status(400).json({ message: "Cette commande n'est pas en paiement direct" });
    }
    if (order.status !== "ACTIVE") {
      return res.status(400).json({ message: "Seule une commande active peut être bloquée" });
    }
    if (order.sellerLockedPayment) {
      return res.status(400).json({ message: "Ce produit est déjà bloqué" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { sellerLockedPayment: true },
    });

    const io = req.app.get("io");
    await notifyUser(io, {
      userId: order.buyerId,
      type: "PAYMENT_LOCKED",
      content: `Le vendeur a confirmé la réception de votre paiement pour "${order.product.name}". Le produit est maintenant bloqué pour vous.`,
      link: `/orders/${id}`,
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}