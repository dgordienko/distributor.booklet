import type { Request, Response } from "express";
import * as productsService from "../services/products.service";

export async function list(_req: Request, res: Response) {
  const products = await productsService.listProducts();
  res.json(products);
}

export async function getOne(req: Request, res: Response) {
  const product = await productsService.getProduct(Number(req.params.id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
}

export async function create(req: Request, res: Response) {
  const {
    categoryIds,
    name,
    manufacturer,
    trademark,
    productType,
    description,
    shelfLife,
    storageTemperature,
    composition,
    basePrice,
    currency,
    isActive,
  } = req.body;
  if (!name || !description) {
    res.status(400).json({ error: "name and description are required" });
    return;
  }
  const product = await productsService.createProduct({
    categoryIds,
    name,
    manufacturer,
    trademark,
    productType,
    description,
    shelfLife,
    storageTemperature,
    composition,
    basePrice,
    currency,
    isActive,
  });
  res.status(201).json(product);
}

export async function update(req: Request, res: Response) {
  const {
    categoryIds,
    name,
    manufacturer,
    trademark,
    productType,
    description,
    shelfLife,
    storageTemperature,
    composition,
    basePrice,
    currency,
    isActive,
  } = req.body;
  const product = await productsService.updateProduct(Number(req.params.id), {
    categoryIds,
    name,
    manufacturer,
    trademark,
    productType,
    description,
    shelfLife,
    storageTemperature,
    composition,
    basePrice,
    currency,
    isActive,
  });
  res.json(product);
}

export async function remove(req: Request, res: Response) {
  await productsService.deleteProduct(Number(req.params.id));
  res.status(204).send();
}

export async function move(req: Request, res: Response) {
  const { categoryId, direction } = req.body;
  if (direction !== "up" && direction !== "down") {
    res.status(400).json({ error: "direction must be 'up' or 'down'" });
    return;
  }
  if (typeof categoryId !== "number") {
    res.status(400).json({ error: "categoryId is required" });
    return;
  }
  const products = await productsService.moveProduct(
    categoryId,
    Number(req.params.id),
    direction,
  );
  res.json(products);
}

export async function uploadPhoto(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: "photo file is required" });
    return;
  }
  const photo = await productsService.addPhoto(Number(req.params.id), {
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
  res.status(201).json(photo);
}

export async function removePhoto(req: Request, res: Response) {
  await productsService.deletePhoto(Number(req.params.photoId));
  res.status(204).send();
}

export async function setPrimaryPhoto(req: Request, res: Response) {
  const product = await productsService.setPrimaryPhoto(
    Number(req.params.id),
    Number(req.params.photoId),
  );
  res.json(product);
}
