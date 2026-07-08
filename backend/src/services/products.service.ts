import { prisma } from "../db/client";

const categoriesInclude = {
  categories: { select: { categoryId: true, order: true } },
} as const;

export function listProducts() {
  return prisma.product.findMany({
    include: { photos: true, ...categoriesInclude },
    orderBy: { createdAt: "asc" },
  });
}

export function getProduct(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: { photos: true, ...categoriesInclude },
  });
}

export interface ProductInput {
  categoryIds?: number[];
  name: string;
  manufacturer?: string;
  trademark?: string;
  productType?: string;
  description: string;
  shelfLife?: string;
  storageTemperature?: string;
  composition?: string;
  basePrice?: number;
  currency?: string;
  isActive?: boolean;
}

async function nextOrderInCategory(categoryId: number) {
  const { _max } = await prisma.productCategory.aggregate({
    _max: { order: true },
    where: { categoryId },
  });
  return (_max.order ?? 0) + 1;
}

export async function createProduct(data: ProductInput) {
  const { categoryIds, ...productData } = data;
  const product = await prisma.product.create({ data: productData });

  for (const categoryId of categoryIds ?? []) {
    await prisma.productCategory.create({
      data: { productId: product.id, categoryId, order: await nextOrderInCategory(categoryId) },
    });
  }

  return getProduct(product.id);
}

export async function updateProduct(id: number, data: Partial<ProductInput>) {
  const { categoryIds, ...productData } = data;
  await prisma.product.update({ where: { id }, data: productData });

  if (categoryIds !== undefined) {
    const existing = await prisma.productCategory.findMany({ where: { productId: id } });
    const existingIds = existing.map((row) => row.categoryId);

    const toRemove = existingIds.filter((categoryId) => !categoryIds.includes(categoryId));
    const toAdd = categoryIds.filter((categoryId) => !existingIds.includes(categoryId));

    if (toRemove.length > 0) {
      await prisma.productCategory.deleteMany({
        where: { productId: id, categoryId: { in: toRemove } },
      });
    }
    for (const categoryId of toAdd) {
      await prisma.productCategory.create({
        data: { productId: id, categoryId, order: await nextOrderInCategory(categoryId) },
      });
    }
  }

  return getProduct(id);
}

export function deleteProduct(id: number) {
  return prisma.product.delete({ where: { id } });
}

// Первое фото товара автоматически становится главным (is_primary).
export async function addPhoto(
  productId: number,
  data: { filename: string; url: string },
) {
  const existingCount = await prisma.photo.count({ where: { productId } });
  return prisma.photo.create({
    data: { ...data, productId, isPrimary: existingCount === 0 },
  });
}

export async function deletePhoto(photoId: number) {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return;
  await prisma.photo.delete({ where: { id: photoId } });

  if (photo.isPrimary) {
    const next = await prisma.photo.findFirst({
      where: { productId: photo.productId },
    });
    if (next) {
      await prisma.photo.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }
}

export async function setPrimaryPhoto(productId: number, photoId: number) {
  await prisma.$transaction([
    prisma.photo.updateMany({
      where: { productId },
      data: { isPrimary: false },
    }),
    prisma.photo.update({ where: { id: photoId }, data: { isPrimary: true } }),
  ]);
  return getProduct(productId);
}

// Меняет местами order с соседним товаром внутри конкретной категории, чтобы
// задать порядок страниц этого товара в разделе буклета. Один и тот же товар
// может иметь разный порядок в разных категориях, поэтому categoryId обязателен.
export async function moveProduct(
  categoryId: number,
  productId: number,
  direction: "up" | "down",
) {
  const siblings = await prisma.productCategory.findMany({
    where: { categoryId },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((row) => row.productId === productId);
  if (index === -1) return listProducts();

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return listProducts();

  const current = siblings[index];
  const neighbor = siblings[swapIndex];
  await prisma.$transaction([
    prisma.productCategory.update({
      where: { id: current.id },
      data: { order: neighbor.order },
    }),
    prisma.productCategory.update({
      where: { id: neighbor.id },
      data: { order: current.order },
    }),
  ]);

  return listProducts();
}
