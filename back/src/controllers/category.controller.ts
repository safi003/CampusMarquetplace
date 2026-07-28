import { Request, Response } from "express";
import prisma from "../lib/prisma";

export async function getCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
}
