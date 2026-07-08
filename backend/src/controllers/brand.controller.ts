import type { Request, Response } from "express";
import * as brandService from "../services/brand.service";

export async function getOne(_req: Request, res: Response) {
  const brand = await brandService.getBrand();
  res.json(brand);
}

export async function update(req: Request, res: Response) {
  const { name, tagline } = req.body;
  const brand = await brandService.updateBrand({ name, tagline });
  res.json(brand);
}

export async function uploadLogo(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: "logo file is required" });
    return;
  }
  const brand = await brandService.updateBrandLogo(
    `/uploads/${req.file.filename}`,
  );
  res.json(brand);
}
