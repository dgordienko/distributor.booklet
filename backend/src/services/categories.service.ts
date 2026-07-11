import { prisma } from "../db/client";

const withTeams = { include: { teams: true } } as const;

// Prisma возвращает frcId как bigint, а express res.json() не умеет
// сериализовать bigint — приводим команды к обычному number перед отдачей.
function serializeCategory<T extends { teams?: { frcId: bigint }[] }>(
  category: T,
) {
  if (!category.teams) return category;
  return {
    ...category,
    teams: category.teams.map((team) => ({ ...team, frcId: Number(team.frcId) })),
  };
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    ...withTeams,
  });
  return categories.map(serializeCategory);
}

export async function getCategory(id: number) {
  const category = await prisma.category.findUnique({
    where: { id },
    ...withTeams,
  });
  return category ? serializeCategory(category) : category;
}

export async function createCategory(data: {
  name: string;
  description: string;
  teamIds?: number[];
}) {
  const { name, description, teamIds } = data;
  const { _max } = await prisma.category.aggregate({ _max: { order: true } });
  const category = await prisma.category.create({
    data: {
      name,
      description,
      order: (_max.order ?? 0) + 1,
      teams: teamIds ? { connect: teamIds.map((id) => ({ id })) } : undefined,
    },
    ...withTeams,
  });
  return serializeCategory(category);
}

export async function updateCategory(
  id: number,
  data: { name?: string; description?: string; teamIds?: number[] },
) {
  const { name, description, teamIds } = data;
  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      description,
      teams: teamIds ? { set: teamIds.map((id) => ({ id })) } : undefined,
    },
    ...withTeams,
  });
  return serializeCategory(category);
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
