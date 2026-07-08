import fs from "node:fs/promises";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import { removeBackground } from "@imgly/background-removal-node";

// publicPath по умолчанию в пакете строится через path.resolve() от process.cwd(),
// а в npm workspace пакет хранится в корневом node_modules — считаем путь явно,
// чтобы не зависеть от того, откуда запущен процесс. У пакета нет subpath-экспорта
// на package.json, поэтому берём каталог от главной точки входа (dist/index.cjs).
const pkgDir = path.dirname(require.resolve("@imgly/background-removal-node"));
const publicPath = `file://${pkgDir}/`;

// Каждое загруженное изображение (фото товара, обложка категории, лого бренда)
// автоматически теряет студийный/однотонный фон и сохраняется как PNG с
// альфа-каналом — чтобы на буклете оно смотрелось на фирменном фоне, а не в
// белом прямоугольнике.
export async function removeImageBackground(req: Request, _res: Response, next: NextFunction) {
  if (!req.file) {
    next();
    return;
  }
  try {
    const blob = await removeBackground(req.file.path, { publicPath });
    const buffer = Buffer.from(await blob.arrayBuffer());

    const pngFilename = `${path.parse(req.file.filename).name}.png`;
    const pngPath = path.join(path.dirname(req.file.path), pngFilename);
    await fs.writeFile(pngPath, buffer);

    if (pngPath !== req.file.path) {
      await fs.unlink(req.file.path);
    }

    req.file.filename = pngFilename;
    req.file.path = pngPath;
    req.file.mimetype = "image/png";
  } catch (err) {
    console.error("Background removal failed, keeping original image:", err);
  }
  next();
}
