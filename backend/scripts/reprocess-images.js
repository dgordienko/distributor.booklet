// Разовый скрипт: прогоняет уже загруженные фото товаров и лого бренда через
// удаление фона (те же правила, что и middleware/removeBackground.ts для новых
// загрузок), чтобы существующие изображения тоже стали прозрачными PNG.
// Категории намеренно не трогаем — там полнокадровые баннеры, а не предметная
// съёмка, сегментация их только испортит.
require("dotenv/config");
const path = require("node:path");
const fs = require("node:fs/promises");
const { PrismaClient } = require("@prisma/client");
const { removeBackground } = require("@imgly/background-removal-node");
const sharp = require("sharp");

const prisma = new PrismaClient();
const uploadsDir = path.resolve(process.env.UPLOADS_DIR ?? "./uploads");
const pkgDir = path.dirname(require.resolve("@imgly/background-removal-node"));
const publicPath = `file://${pkgDir}/`;

async function hasRealTransparency(filePath) {
  const meta = await sharp(filePath).metadata();
  if (!meta.hasAlpha) return false;
  const { data, info } = await sharp(filePath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] < 250) return true;
  }
  return false;
}

async function processFile(oldFilename) {
  const oldPath = path.join(uploadsDir, oldFilename);
  try {
    await fs.access(oldPath);
  } catch {
    console.warn(`  файл не найден на диске, пропуск: ${oldFilename}`);
    return null;
  }

  if (await hasRealTransparency(oldPath)) {
    console.log(`  уже прозрачный, пропуск: ${oldFilename}`);
    return null;
  }

  const blob = await removeBackground(oldPath, { publicPath });
  const buffer = Buffer.from(await blob.arrayBuffer());

  const newFilename = `${path.parse(oldFilename).name}.png`;
  const newPath = path.join(uploadsDir, newFilename);
  await fs.writeFile(newPath, buffer);
  if (newPath !== oldPath) {
    await fs.unlink(oldPath);
  }
  return newFilename;
}

async function main() {
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  const photos = await prisma.photo.findMany();
  console.log(`Фото товаров: ${photos.length}`);
  for (const photo of photos) {
    console.log(`[photo ${photo.id}] ${photo.filename}`);
    try {
      const newFilename = await processFile(photo.filename);
      if (newFilename) {
        await prisma.photo.update({
          where: { id: photo.id },
          data: { filename: newFilename, url: `/uploads/${newFilename}` },
        });
        console.log(`  -> ${newFilename}`);
        processed++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`  ОШИБКА: ${err.message}`);
      failed++;
    }
  }

  const brand = await prisma.brand.findUnique({ where: { id: 1 } });
  if (brand && brand.logoUrl) {
    const filename = brand.logoUrl.replace(/^\/uploads\//, "");
    console.log(`[brand logo] ${filename}`);
    try {
      const newFilename = await processFile(filename);
      if (newFilename) {
        await prisma.brand.update({
          where: { id: 1 },
          data: { logoUrl: `/uploads/${newFilename}` },
        });
        console.log(`  -> ${newFilename}`);
        processed++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`  ОШИБКА: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nГотово: обработано ${processed}, пропущено ${skipped}, ошибок ${failed}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
