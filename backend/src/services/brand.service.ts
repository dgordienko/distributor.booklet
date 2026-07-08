import { prisma } from "../db/client";

const BRAND_ID = 1;

export function getBrand() {
  return prisma.brand.upsert({
    where: { id: BRAND_ID },
    create: { id: BRAND_ID },
    update: {},
  });
}

export function updateBrand(data: { name?: string; tagline?: string }) {
  return prisma.brand.upsert({
    where: { id: BRAND_ID },
    create: { id: BRAND_ID, ...data },
    update: data,
  });
}

export function updateBrandLogo(logoUrl: string) {
  return prisma.brand.upsert({
    where: { id: BRAND_ID },
    create: { id: BRAND_ID, logoUrl },
    update: { logoUrl },
  });
}
