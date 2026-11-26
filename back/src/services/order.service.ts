import type { Server } from "socket.io";
import prisma from "../lib/prisma";
import { notifyUser } from "../lib/notify";

export async function checkAndExpireActiveOrder(productId: number) {
  const active = await prisma.order.findFirst({
    where: { productId, status: "ACTIVE" },
  });

  if (!active) {
    return null;
  }

  if (active.paymentType === "SECURED" && active.paymentLockedByStaff) {
    return active;
  }

  if (!active.expiresAt || active.expiresAt > new Date()) {
    return active;
  }

  return await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: active.id },
      data: { status: "EXPIRED", expiresAt: null },
    });

    await tx.product.update({
      where: { id: productId },
      data: { status: "AVAILABLE" },
    });
    return null;
  });
}

export async function notify(
  userId: number,
  type: string,
  content: string,
  link: string | undefined,
  io?: Server | null
) {
  if (io) {
    return notifyUser(io, { userId, type, content, link });
  }

  return prisma.notification.create({
    data: { userId, type, content, link: link ?? null },
  });
}