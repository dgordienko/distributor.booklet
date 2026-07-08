import { prisma } from "../db/client";

export function listCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export function getCategory(id: number) {
  return prisma.category.findUnique({ where: { id } });
}

export async function createCategory(data: {
  name: string;
  description: string;
}) {
  const { _max } = await prisma.category.aggregate({ _max: { order: true } });
  return prisma.category.create({
    data: { ...data, order: (_max.order ?? 0) + 1 },
  });
}

export function updateCategory(
  id: number,
  data: { name?: string; description?: string },
) {
  return prisma.category.update({ where: { id }, data });
}

export function updateCategoryImage(id: number, imageUrl: string) {
  return prisma.category.update({ where: { id }, data: { imageUrl } });
}

export function deleteCategory(id: number) {
  return prisma.category.delete({ where: { id } });
}

// Меняет местами order с соседней категорией, чтобы задать порядок разделов буклета.
export async function moveCategory(id: number, direction: "up" | "down") {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return listCategories();

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= categories.length) return listCategories();

  const current = categories[index];
  const neighbor = categories[swapIndex];
  await prisma.$transaction([
    prisma.category.update({
      where: { id: current.id },
      data: { order: neighbor.order },
    }),
    prisma.category.update({
      where: { id: neighbor.id },
      data: { order: current.order },
    }),
  ]);

  return listCategories();
}
