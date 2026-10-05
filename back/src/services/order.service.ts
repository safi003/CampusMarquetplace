import prisma from "../lib/prisma";

export async function checkAndExpireActiveOrder(productId: number) {
  const active = await prisma.order.findFirst({
    where: { productId, status: "ACTIVE" },
  });

  if (!active) {
    return null; // rien d'actif, rien à faire
  }

  // Protégé : paiement sécurisé déjà verrouillé par le staff → ne jamais expirer
  if (active.paymentType === "SECURED" && active.paymentLockedByStaff) {
    return active;
  }

  // Pas encore expiré → rien à faire
  if (!active.expiresAt || active.expiresAt > new Date()) {
    return active;
  }

  // Expiré : on bascule et on active le suivant dans la file
  return await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: active.id },
      data: { status: "EXPIRED" },
    });

    const next = await tx.order.findFirst({
      where: { productId, status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });

    if (next) {
      return tx.order.update({
        where: { id: next.id },
        data: {
          status: "ACTIVE",
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    }

    // personne en attente → le produit redevient disponible
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
  link?: string
) {
  return prisma.notification.create({
    data: { userId, type, content, link },
  });
}